import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courseId, courseTitle, courseDescription } = await req.json();
    console.log('Generating questions for course:', courseId, courseTitle);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Prepare prompt for Gemini
    const prompt = `You are a professional educator creating a test for a course titled "${courseTitle}" with the following description: "${courseDescription}".

Please generate 20 multiple choice questions that:
1. Are specifically focused on ${courseTitle}
2. Test understanding of key concepts from the course description
3. Have exactly 4 options (labeled A, B, C, D)
4. Have one correct answer
5. Are worth 5 points each
6. Are challenging but fair

Format each question as a JSON object with these exact fields:
{
  "question": "The question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": 0 // Index of correct answer (0-3)
}

Return an array of 20 such question objects.`;

    console.log('Sending prompt to Gemini:', prompt);

    // Call Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('GEMINI_API_KEY')}`,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      throw new Error('Failed to get response from Gemini API');
    }

    const data = await response.json();
    console.log('Received response from Gemini');

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini response structure:', JSON.stringify(data));
      throw new Error('Invalid response structure from Gemini');
    }

    // Parse the response and extract questions
    const responseText = data.candidates[0].content.parts[0].text;
    console.log('Raw Gemini response:', responseText);

    // Look for JSON array in the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Could not find JSON array in response:', responseText);
      throw new Error('Could not find questions in Gemini response');
    }

    let questions;
    try {
      questions = JSON.parse(jsonMatch[0]);
      console.log(`Successfully parsed ${questions.length} questions`);
    } catch (error) {
      console.error('JSON parse error:', error);
      throw new Error('Failed to parse questions from Gemini response');
    }

    // Validate questions format
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format: not an array or empty array');
    }

    // Validate each question
    questions.forEach((q, index) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || 
          typeof q.correct_answer !== 'number' || q.correct_answer < 0 || q.correct_answer > 3) {
        console.error('Invalid question format:', q);
        throw new Error(`Invalid format for question ${index + 1}`);
      }
    });

    // Insert questions into the database
    const { error: insertError } = await supabase
      .from('test_questions')
      .insert(
        questions.map((q) => ({
          course_id: courseId,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          marks: 5
        }))
      );

    if (insertError) {
      console.error('Error inserting questions:', insertError);
      throw insertError;
    }

    console.log('Successfully inserted questions');
    return new Response(
      JSON.stringify({ success: true, questionCount: questions.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-test-questions function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});