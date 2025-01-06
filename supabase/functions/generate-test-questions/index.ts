import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courseId, courseTitle, courseDescription } = await req.json();
    console.log('Generating questions for course:', { courseId, courseTitle });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');

    if (!supabaseUrl || !supabaseKey || !perplexityKey) {
      console.error('Missing required environment variables');
      throw new Error('Server configuration error');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const prompt = `Generate a multiple choice test for the course "${courseTitle}" with description "${courseDescription}".

Create 5 multiple choice questions that:
1. Test understanding of key concepts
2. Have exactly 4 options each
3. Have one correct answer
4. Are worth 5 points each

Format each question as a JSON object with these fields:
{
  "question": "Question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": 0
}

Return an array of exactly 5 such question objects. The response must be a valid JSON array.`;

    console.log('Sending request to Perplexity API');
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online', // Using the smallest model for cost efficiency
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates multiple choice questions in JSON format. Be precise and concise.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        top_p: 0.9,
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      console.error('Perplexity API error status:', response.status);
      const errorText = await response.text();
      console.error('Perplexity API error response:', errorText);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received response from Perplexity');

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid Perplexity response structure:', JSON.stringify(data));
      throw new Error('Invalid response structure from Perplexity');
    }

    const responseText = data.choices[0].message.content;
    console.log('Raw Perplexity response:', responseText);

    // Extract JSON array from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Could not find JSON array in response');
      throw new Error('Invalid response format from Perplexity');
    }

    let questions;
    try {
      questions = JSON.parse(jsonMatch[0]);
      console.log(`Successfully parsed ${questions.length} questions`);
    } catch (error) {
      console.error('JSON parse error:', error);
      throw new Error('Failed to parse questions from Perplexity response');
    }

    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format: not an array or empty array');
    }

    questions.forEach((q, index) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || 
          typeof q.correct_answer !== 'number' || q.correct_answer < 0 || q.correct_answer > 3) {
        console.error('Invalid question format:', q);
        throw new Error(`Invalid format for question ${index + 1}`);
      }
    });

    // Delete existing questions for this course
    const { error: deleteError } = await supabase
      .from('test_questions')
      .delete()
      .eq('course_id', courseId);

    if (deleteError) {
      console.error('Error deleting existing questions:', deleteError);
      throw deleteError;
    }

    // Insert new questions
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