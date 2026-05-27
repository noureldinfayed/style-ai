import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  try {
    const { image, modesty, occasion, language } = await req.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are a professional fashion stylist specializing in Egyptian and MENA fashion culture.

The user has uploaded a photo of a clothing item. Analyze what you see and suggest 3 complete outfit combinations that include this piece.

Modesty level: ${modesty}
Occasion: ${occasion}
Market: Egypt/MENA

For each outfit return:
- Outfit name
- List of 4-6 clothing items and accessories
- One short styling tip (max 15 words)

Rules:
- If modesty is "modest" all outfits must be hijab-friendly and fully covered
- If modesty is "balanced" suggest tasteful modest-leaning looks
- If modesty is "free" suggest trendy unrestricted looks
- All suggestions must be realistic for Egyptian weather and culture
- Mention specific colors and fabrics

Respond in ${language === 'ar' ? 'Arabic' : 'English'} only.
Return as JSON array with this structure exactly, no markdown, no backticks:
[
  {
    "name": "outfit name",
    "items": ["item 1", "item 2", "item 3", "item 4"],
    "tip": "styling tip here"
  }
]`

    const base64Data = image.split(',')[1]
    const mimeType = image.split(';')[0].split(':')[1]

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
        },
      },
    ])

    let text = result.response.text().trim()

    // Strip markdown code fences if Gemini wraps response
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    }

    const outfits = JSON.parse(text)

    return NextResponse.json({ outfits })
  } catch (err) {
    console.error('Style API error:', err)
    return NextResponse.json({ error: 'Failed to generate outfits' }, { status: 500 })
  }
}
