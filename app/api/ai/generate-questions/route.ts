import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleGenAI } from '@google/genai'

// Initialize Gemini AI
function getAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables')
  }
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  })
}

interface QuestionRequest {
  topic: string
  count: number
  difficulty: 'easy' | 'medium' | 'hard'
  questionTypes: string[]
  pointsPerQuestion: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured. Please contact administrator.' },
        { status: 500 }
      )
    }

    const body: QuestionRequest = await request.json()
    const { topic, count, difficulty, questionTypes, pointsPerQuestion } = body

    // Validate input
    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      )
    }

    if (count < 1 || count > 20) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 20' },
        { status: 400 }
      )
    }

    if (!questionTypes || questionTypes.length === 0) {
      return NextResponse.json(
        { error: 'At least one question type must be selected' },
        { status: 400 }
      )
    }

    // Create the prompt for AI
    const prompt = `You are an expert exam creator. Generate exactly ${count} exam questions about "${topic}" with ${difficulty} difficulty level.

Question types to include: ${questionTypes.join(', ')}

IMPORTANT: You must respond with ONLY valid JSON, no other text. The JSON must be an array of question objects.

For each question, use this exact JSON structure:
[
  {
    "questionText": "The question text here",
    "questionType": "multiple_choice" | "true_false" | "short_answer" | "essay",
    "options": ["option1", "option2", "option3", "option4"], // Only for multiple_choice, empty array otherwise
    "correctAnswer": "correct option text" | "True" | "False" | "", // Empty string for short_answer and essay
    "points": ${pointsPerQuestion}
  }
]

Requirements:
1. For multiple_choice questions: Provide exactly 4 options, and correctAnswer must be one of the options (exact text match)
2. For true_false questions: correctAnswer must be exactly "True" or "False"
3. For short_answer and essay questions: correctAnswer should be an empty string ""
4. Mix question types based on the requested types: ${questionTypes.join(', ')}
5. Make questions educational, clear, and appropriate for ${difficulty} difficulty
6. Ensure proper grammar and spelling
7. For ${difficulty} difficulty:
   ${difficulty === 'easy' ? '- Use straightforward language\n   - Test basic concepts\n   - Avoid tricky wording' : ''}
   ${difficulty === 'medium' ? '- Test understanding and application\n   - Include some analytical thinking\n   - Use moderate complexity' : ''}
   ${difficulty === 'hard' ? '- Test deep understanding\n   - Require critical thinking\n   - Include complex scenarios' : ''}

Generate exactly ${count} questions now. Return ONLY the JSON array, no markdown formatting, no code blocks, no explanatory text.`

    const response = await getAI().models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    })

    let text = response.text || ''

    // Clean up the response - remove markdown code blocks if present
    text = text.trim()
    if (text.startsWith('```json')) {
      text = text.slice(7)
    } else if (text.startsWith('```')) {
      text = text.slice(3)
    }
    if (text.endsWith('```')) {
      text = text.slice(0, -3)
    }
    text = text.trim()

    // Parse the JSON
    let questions
    try {
      questions = JSON.parse(text)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      )
    }

    // Validate the response structure
    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Invalid AI response format' },
        { status: 500 }
      )
    }

    // Validate and clean each question
    const validatedQuestions = questions.map((q, index) => {
      if (!q.questionText || typeof q.questionText !== 'string') {
        throw new Error(`Question ${index + 1}: Missing or invalid questionText`)
      }

      const validTypes = ['multiple_choice', 'true_false', 'short_answer', 'essay']
      if (!validTypes.includes(q.questionType)) {
        throw new Error(`Question ${index + 1}: Invalid question type`)
      }

      if (q.questionType === 'multiple_choice') {
        if (!Array.isArray(q.options) || q.options.length < 2) {
          throw new Error(`Question ${index + 1}: Multiple choice questions must have at least 2 options`)
        }
        if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
          throw new Error(`Question ${index + 1}: Correct answer must be one of the options`)
        }
      }

      if (q.questionType === 'true_false') {
        if (q.correctAnswer !== 'True' && q.correctAnswer !== 'False') {
          throw new Error(`Question ${index + 1}: True/False answer must be "True" or "False"`)
        }
      }

      return {
        questionText: q.questionText.trim(),
        questionType: q.questionType,
        options: q.questionType === 'multiple_choice' ? q.options : [],
        correctAnswer: q.correctAnswer || '',
        points: pointsPerQuestion,
      }
    })

    return NextResponse.json({
      success: true,
      questions: validatedQuestions,
      count: validatedQuestions.length,
    })

  } catch (error) {
    console.error('AI Generation Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate questions' },
      { status: 500 }
    )
  }
}
