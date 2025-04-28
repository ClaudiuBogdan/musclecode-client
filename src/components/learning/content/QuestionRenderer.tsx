import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { LessonQuestion } from '@/types/lesson';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, ChevronRight, Lightbulb, Loader2, AlertCircle } from 'lucide-react';
import { useCheckQuestionAnswer } from '@/services/content/hooks';
import { CheckAnswerResponse } from '@/services/content/api';

// Props now directly use LessonQuestion and add callbacks
interface QuestionRendererProps {
  lessonQuestion: LessonQuestion & { id: string };
}

// Use CheckAnswerResponse as the type for evaluationResult
type EvaluationResult = CheckAnswerResponse;

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  lessonQuestion,
}) => {
  const { id: questionId, question, correctionCriteria } = lessonQuestion;
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Use the mutation hook
  const { mutate: checkAnswer, isPending, isError, error, data: apiResult, reset } = useCheckQuestionAnswer();

  // Effect to update state when API call succeeds
  useEffect(() => {
    if (apiResult) {
      setEvaluationResult(apiResult);
      setIsSubmitted(true);
    }
  }, [apiResult]);

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;
    // Call the mutation
    checkAnswer({ questionId, payload: { userAnswer, lessonQuestion } });
  };

  const handleRedo = () => {
    setIsSubmitted(false);
    setEvaluationResult(null);
    setUserAnswer('');
    setShowHint(false);
    reset(); // Reset mutation state
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  // Combine points and answers for markscheme display
  const markschemeItems = correctionCriteria.map(c => (
    <li key={c.answer} className="mb-1 last:mb-0">
      <span className="font-semibold">[{c.points} mark]</span>: {c.answer} ({c.explanation})
    </li>
  ));

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 p-4">
      {/* Main Question Card */}
      <Card className="border overflow-hidden shadow-sm">
        <CardHeader className="bg-purple-50 dark:bg-purple-950/30 p-4 flex flex-row justify-between items-center">
           <div className="flex items-center gap-2">
             <span className="bg-purple-200 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">QUESTION</span>
           </div>
           <Button variant="outline" size="sm" onClick={toggleHint} className="flex items-center gap-1">
             <Lightbulb className="h-4 w-4" />
             Hint {!showHint && '+1'}
           </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
           <p className="text-lg font-semibold">{question}</p>

          {!isSubmitted ? (
            <div className="relative">
              <Textarea
                placeholder="Type your answer here..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                rows={5}
                className="resize-none border focus:border-purple-500 focus:ring-purple-500"
                disabled={isPending || isSubmitted}
              />
              {isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/30 rounded-md">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                </div>
              )}
            </div>
          ) : (
             // Display submitted answer (read-only)
            <Textarea
              value={userAnswer}
              readOnly
              rows={5}
              className="resize-none border bg-gray-50 dark:bg-gray-800"
            />
          )}

          {/* Hints Area - Conditional */}
           {showHint && (
             <Alert variant="default" className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-700/50">
               <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
               <AlertTitle className="text-yellow-800 dark:text-yellow-300">Hint</AlertTitle>
               <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                 {/* Simple hint: show first criterion explanation. Enhance as needed */}
                 {correctionCriteria.length > 0 ? correctionCriteria[0].explanation : 'No hint available.'}
               </AlertDescription>
             </Alert>
           )}


          {/* Evaluation Feedback - Conditional */}
          {isSubmitted && evaluationResult && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <span className="font-semibold text-lg text-black dark:text-white">{evaluationResult.score}/{evaluationResult.maxScore}</span>
              </h3>
              {evaluationResult.feedbackItems.map((item, index) => (
                <Alert key={index} className={`border-l-4 p-4 ${item.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300' : 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300'}`}>
                  <div className="flex items-start gap-3">
                     {item.isCorrect ? <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" /> : <XCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />}
                     <div className="flex-grow">
                       <AlertDescription>
                         {/* Display feedback based on explanation and met status */} 
                         {item.isCorrect 
                           ? `Correct: ${item.explanation}` 
                           : `Incorrect: ${item.explanation}`}
                       </AlertDescription>
                     </div>
                   </div>
                </Alert>
              ))}
            </div>
          )}

           {/* Markscheme - Conditional Rendering */}
           {isSubmitted && (
             <Card className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/80 mt-4">
               <CardHeader className="p-3 border-b border-gray-200 dark:border-gray-700/80">
                 <CardTitle className="text-sm font-medium">Markscheme</CardTitle>
               </CardHeader>
               <CardContent className="p-3 text-sm text-gray-700 dark:text-gray-300">
                 <ul className="list-disc list-inside space-y-1">
                    {markschemeItems}
                 </ul>
               </CardContent>
             </Card>
            )}

        </CardContent>
      </Card>

      {/* Footer Actions */}
      {isSubmitted && (
        <div className="flex justify-end p-4 border-t">
          <Button variant="outline" onClick={handleRedo}>
            Redo
          </Button>
        </div>
      )}

       {/* Initial Submit Button */}
        {!isSubmitted && (
           <div className="flex justify-end p-4 border-t">
              <Button 
                 onClick={handleSubmit} 
                 disabled={!userAnswer.trim() || isPending}
                 className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5"
               >
                 {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Checking...
                    </>
                 ) : (
                    <>
                     Check Answer <ChevronRight className="h-4 w-4"/>
                   </>
                 )}
               </Button>
           </div>
        )}

        {/* API Error Message */} 
        {isError && (
           <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error?.message || 'Failed to check answer. Please try again.'}
              </AlertDescription>
           </Alert>
        )}
    </div>
  );
}; 