import { createLogger } from '@/lib/logger';
import { 
  type InteractionRequestDto, 
  type EventDto, 
  type QuizAnswerPayload,
  type QuestionSubmitPayload,
  EventType,
  sendInteraction
} from '@/services/content/api';
import { useSendInteraction } from '@/services/content/hooks';
import { showToast } from '@/utils/toast';

const logger = createLogger('InteractionTracker');

/**
 * Configuration for interaction sending behavior
 */
interface InteractionConfig {
    /** Custom error message for toast notification */
    errorMessage?: string;
    /** Whether to show toast on error (default: true) */
    showErrorToast?: boolean;
}

/**
 * Sends user interaction data to the backend API in a fire-and-forget manner.
 * This function is non-blocking and handles errors gracefully with toast notifications.
 * 
 * @param nodeId - UUID of the content node (lesson, quiz, etc.)
 * @param quizId - ID of the quiz item
 * @param selectedOption - Selected option index
 * @param isCorrect - Whether the answer was correct
 * @param config - Optional configuration for behavior customization
 */
async function trackQuizAnswer(
    nodeId: string,
    quizId: string,
    selectedOption: number,
    isCorrect: boolean,
    config: InteractionConfig = {}
): Promise<void> {
    const {
        errorMessage = 'Failed to save your quiz answer. Your progress may not be recorded.',
        showErrorToast = true
    } = config;

    try {
        const payload: QuizAnswerPayload = {
            quizId,
            selectedOption,
            isCorrect,
            timestamp: new Date().toISOString()
        };

        const event: EventDto = {
            type: EventType.QUIZ_ANSWER,
            payload
        };

        const requestPayload: InteractionRequestDto = {
            nodeId,
            event
        };

        await sendInteraction(requestPayload);

        logger.debug('Quiz interaction tracked successfully', {
            nodeId,
            quizId,
            selectedOption,
            isCorrect
        });

    } catch (error) {
        logger.error('Failed to track quiz interaction', {
            nodeId,
            quizId,
            error: error instanceof Error ? error.message : String(error)
        });

        if (showErrorToast) {
            showToast.error(errorMessage);
        }
    }
}

async function trackQuestionAnswer(
    nodeId: string,
    questionId: string,
    userAnswer: string,
    score: number,
    maxScore: number,
    isCorrect: boolean,
    feedbackItems: { isCorrect: boolean; explanation: string; points: number; }[] = [],
    config: InteractionConfig = {}
): Promise<void> {
    const {
        errorMessage = 'Failed to save your question answer. Your progress may not be recorded.',
        showErrorToast = true
    } = config;

    try {
        const payload: QuestionSubmitPayload = {
            questionId,
            userAnswer: userAnswer.substring(0, 1000),
            score,
            maxScore,
            isCorrect,
            timestamp: new Date().toISOString(),
            feedbackItems
        };

        const event: EventDto = {
            type: EventType.QUESTION_SUBMIT,
            payload
        };

        const requestPayload: InteractionRequestDto = {
            nodeId,
            event
        };

        await sendInteraction(requestPayload);

        logger.debug('Question interaction tracked successfully', {
            nodeId,
            questionId,
            score,
            maxScore,
            isCorrect
        });

    } catch (error) {
        logger.error('Failed to track question interaction', {
            nodeId,
            questionId,
            error: error instanceof Error ? error.message : String(error)
        });

        if (showErrorToast) {
            showToast.error(errorMessage);
        }
    }
}

/**
 * Utility function specifically for quiz interactions
 * 
 * @param nodeId - Quiz/lesson node ID
 * @param quizId - Unique ID for the quiz item/question
 * @param selectedOption - Selected option index
 * @param isCorrect - Whether the answer was correct
 */
export function trackQuizInteraction(
    nodeId: string,
    quizId: string,
    selectedOption: number,
    isCorrect: boolean,
): Promise<void> {
    return trackQuizAnswer(nodeId, quizId, selectedOption, isCorrect);
}

/**
 * Utility function specifically for question interactions
 * 
 * @param nodeId - Question/lesson node ID
 * @param questionId - Specific question ID
 * @param userAnswer - User's text answer
 * @param score - Score received (if available)
 * @param maxScore - Maximum possible score (if available)
 * @param feedbackItems - Feedback items from the response
 */
export function trackQuestionInteraction(
    nodeId: string,
    questionId: string,
    userAnswer: string,
    score?: number,
    maxScore?: number,
    feedbackItems?: { isCorrect: boolean; explanation: string; points: number; }[]
): Promise<void> {
    const isCorrect = score === maxScore && score !== undefined && maxScore !== undefined;
    return trackQuestionAnswer(
        nodeId, 
        questionId, 
        userAnswer, 
        score ?? 0, 
        maxScore ?? 0, 
        isCorrect,
        feedbackItems ?? []
    );
}

/**
 * Hook-based version that uses React Query mutation for component integration
 * This provides more React-friendly state management and automatic cache updates
 */
export function useInteractionTracker(lessonId?: string) {
    const mutation = useSendInteraction(lessonId);

    return {
        trackQuiz: async (
            nodeId: string,
            quizId: string,
            selectedOption: number,
            isCorrect: boolean,
        ) => {
            try {
                const payload: QuizAnswerPayload = {
                    quizId,
                    selectedOption,
                    isCorrect,
                    timestamp: new Date().toISOString()
                };

                const event: EventDto = {
                    type: EventType.QUIZ_ANSWER,
                    payload
                };

                const requestPayload: InteractionRequestDto = {
                    nodeId,
                    event
                };

                await mutation.mutateAsync(requestPayload);

                logger.debug('Quiz interaction tracked successfully', {
                    nodeId,
                    quizId,
                    selectedOption,
                    isCorrect
                });
            } catch (error) {
                logger.error('Failed to track quiz interaction', {
                    nodeId,
                    quizId,
                    error: error instanceof Error ? error.message : String(error)
                });

                showToast.error('Failed to save your quiz answer. Your progress may not be recorded.');
            }
        },
        trackQuestion: async (
            nodeId: string,
            questionId: string,
            userAnswer: string,
            score?: number,
            maxScore?: number,
            feedbackItems?: { isCorrect: boolean; explanation: string; points: number; }[]
        ) => {
            try {
                const isCorrect = score === maxScore && score !== undefined && maxScore !== undefined;
                
                const payload: QuestionSubmitPayload = {
                    questionId,
                    userAnswer: userAnswer.substring(0, 1000),
                    score: score ?? 0,
                    maxScore: maxScore ?? 0,
                    isCorrect,
                    timestamp: new Date().toISOString(),
                    feedbackItems: feedbackItems ?? []
                };

                const event: EventDto = {
                    type: EventType.QUESTION_SUBMIT,
                    payload
                };

                const requestPayload: InteractionRequestDto = {
                    nodeId,
                    event
                };

                await mutation.mutateAsync(requestPayload);

                logger.debug('Question interaction tracked successfully', {
                    nodeId,
                    questionId,
                    score: score ?? 0,
                    maxScore: maxScore ?? 0,
                    isCorrect
                });
            } catch (error) {
                logger.error('Failed to track question interaction', {
                    nodeId,
                    questionId,
                    error: error instanceof Error ? error.message : String(error)
                });

                showToast.error('Failed to save your question answer. Your progress may not be recorded.');
            }
        }
    };
} 