import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { LessonQuestion } from '@/types/lesson';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';

// Props now directly use LessonQuestion and add callbacks
interface QuestionRendererProps {
  lessonQuestion: LessonQuestion;
  onComplete: (isCorrect: boolean, score: number, maxScore: number) => void; // Callback remains
}

interface EvaluationResult {
  score: number;
  maxScore: number;
  isCorrect: boolean;
  feedbackItems: {
    isMet: boolean;
    explanation: string;
    points: number;
  }[];
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  lessonQuestion,
  onComplete,
}) => {
  const { question, correctionCriteria } = lessonQuestion;
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [showHint, setShowHint] = useState(false); // Basic hint visibility

  const maxScore = correctionCriteria.reduce((sum, criterion) => sum + criterion.points, 0);

  const evaluateAnswer = (): EvaluationResult => {
    // MOCK IMPLEMENTATION: Assume incorrect answer for now
    const score = 0;
    const feedbackItems = correctionCriteria.map(criterion => ({
      isMet: false, // Force all criteria to be unmet
      explanation: criterion.explanation,
      points: criterion.points,
    }));

    return {
      score,
      maxScore,
      isCorrect: false, // Force incorrect result
      feedbackItems,
    };
  };

  const handleSubmit = () => {
    const result = evaluateAnswer();
    setEvaluationResult(result);
    setIsSubmitted(true);
    // Optionally call onComplete immediately or wait for "Finish" click
  };

  const handleRedo = () => {
    setIsSubmitted(false);
    setEvaluationResult(null);
    setUserAnswer('');
    setShowHint(false);
  };

  const handleFinish = () => {
    if (evaluationResult) {
      onComplete(evaluationResult.isCorrect, evaluationResult.score, evaluationResult.maxScore);
    }
    // Add navigation logic here if needed
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
            <Textarea
              placeholder="Type your answer here..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              rows={5}
              className="resize-none border focus:border-purple-500 focus:ring-purple-500"
              disabled={isSubmitted}
            />
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
                <Alert key={index} className={`border-l-4 p-4 ${item.isMet ? 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300' : 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300'}`}>
                  <div className="flex items-start gap-3">
                     {item.isMet ? <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" /> : <XCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />}
                     <div className="flex-grow">
                       <AlertDescription>
                         {/* Display feedback based on explanation and met status */} 
                         {item.isMet 
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
      {isSubmitted && evaluationResult && (
         <div className={`p-4 rounded-md flex items-center justify-between ${evaluationResult.isCorrect ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
           <div className="flex items-center gap-2">
             {evaluationResult.isCorrect ? <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" /> : <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />}
             <span className={`font-semibold ${evaluationResult.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
               {evaluationResult.isCorrect ? 'Correct' : 'Incorrect'}
             </span>
           </div>
           <div className="flex items-center gap-2">
              {!evaluationResult.isCorrect && (
                 <Button variant="outline" size="sm" onClick={handleRedo}>
                    Redo
                 </Button>
              )}
               {evaluationResult.isCorrect && (
                  <Button variant="outline" size="sm" > {/* Add navigation logic */}
                     <ChevronLeft className="h-4 w-4 mr-1"/> Previous
                  </Button>
               )}
             <Button size="sm" onClick={handleFinish} className={`${evaluationResult.isCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}>
                Finish <ChevronRight className="h-4 w-4 ml-1"/>
              </Button>
           </div>
         </div>
       )}

       {/* Initial Submit Button */}
        {!isSubmitted && (
           <div className="flex justify-end p-4 border-t">
              <Button onClick={handleSubmit} disabled={!userAnswer.trim()} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Check Answer <ChevronRight className="h-4 w-4 ml-1"/>
              </Button>
           </div>
        )}
    </div>
  );
}; 