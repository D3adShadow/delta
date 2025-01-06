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
    const prompt = `Generate 20 multiple choice questions for a course titled "${courseTitle}" with description "${courseDescription}". 
    Each question should:
    - Be directly related to the course content
    - Have exactly 4 options
    - Have one correct answer
    - Be worth 5 points
    - Be challenging but fair
    
    Format the response as a JSON array with objects containing:
    - question (string)
    - options (array of 4 strings)
    - correct_answer (integer 0-3)
    
    Make sure the questions test understanding rather than just memorization.`;

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
        }]
      })
    });

    const data = await response.json();
    console.log('Received response from Gemini');

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini');
    }

    // Parse the response and extract questions
    const responseText = data.candidates[0].content.parts[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not find JSON in Gemini response');
    }

    const questions = JSON.parse(jsonMatch[0]);
    console.log(`Parsed ${questions.length} questions`);

    // Insert questions into the database
    const { error: insertError } = await supabase
      .from('test_questions')
      .insert(
        questions.map((q: any) => ({
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