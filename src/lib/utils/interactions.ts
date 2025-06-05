

import { createLogger } from '@/lib/logger';
import { type InteractionRequestDto, type InteractionDataDto, sendInteraction } from '@/services/content/api';
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
 * @param interactionType - Type of interaction (e.g., 'quiz_answer', 'question_submit')
 * @param interactionData - Flexible data object for interaction-specific information
 * @param config - Optional configuration for behavior customization
 */
async function trackQuizAnswer(
    nodeId: string,
    itemId: string,
    selectedOption: number,
    isCorrect: boolean,
    config: InteractionConfig = {}
): Promise<void> {
    const {
        errorMessage = 'Failed to save your quiz answer. Your progress may not be recorded.',
        showErrorToast = true
    } = config;

    try {
        const interaction: InteractionDataDto = {
            id: itemId,
            type: 'quiz_answer',
            data: {
                selectedOption,
                isCorrect,
                timestamp: new Date().toISOString()
            }
        };

        const payload: InteractionRequestDto = {
            nodeId,
            interaction
        };

        await sendInteraction(payload);

        logger.debug('Quiz interaction tracked successfully', {
            nodeId,
            itemId,
            selectedOption,
            isCorrect
        });

    } catch (error) {
        logger.error('Failed to track quiz interaction', {
            nodeId,
            itemId,
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
    feedbackItems?: { isCorrect: boolean; explanation: string; points: number; }[],
    config: InteractionConfig = {}
): Promise<void> {
    const {
        errorMessage = 'Failed to save your question answer. Your progress may not be recorded.',
        showErrorToast = true
    } = config;

    try {
        const interaction: InteractionDataDto = {
            id: questionId,
            type: 'question_submit',
            data: {
                userAnswer: userAnswer.substring(0, 1000),
                score,
                maxScore,
                isCorrect,
                timestamp: new Date().toISOString(),
                feedbackItems
            }
        };

        const payload: InteractionRequestDto = {
            nodeId,
            interaction
        };

        await sendInteraction(payload);

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
 * @param itemId - Unique ID for the quiz item/question
 * @param selectedOption - Selected option index
 * @param isCorrect - Whether the answer was correct
 */
export function trackQuizInteraction(
    nodeId: string,
    itemId: string,
    selectedOption: number,
    isCorrect: boolean,
): Promise<void> {
    return trackQuizAnswer(nodeId, itemId, selectedOption, isCorrect);
}

/**
 * Utility function specifically for question interactions
 * 
 * @param nodeId - Question/lesson node ID
 * @param questionId - Specific question ID
 * @param userAnswer - User's text answer
 * @param score - Score received (if available)
 * @param maxScore - Maximum possible score (if available)
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
        feedbackItems
    );
}

/**
 * Hook-based version that uses React Query mutation for component integration
 * This provides more React-friendly state management if needed
 */
export function useInteractionTracker() {
    return {
        trackQuiz: (
            nodeId: string,
            interactionId: string,
            selectedOption: number,
            isCorrect: boolean,
        ) => {
            // Run in background without blocking
            void trackQuizAnswer(nodeId, interactionId, selectedOption, isCorrect);
        },
        trackQuestion: (
            nodeId: string,
            questionId: string,
            userAnswer: string,
            score?: number,
            maxScore?: number,
            feedbackItems?: { isCorrect: boolean; explanation: string; points: number; }[]
        ) => {
            const isCorrect = score === maxScore && score !== undefined && maxScore !== undefined;
            // Run in background without blocking
            void trackQuestionAnswer(
                nodeId, 
                questionId, 
                userAnswer, 
                score ?? 0, 
                maxScore ?? 0, 
                isCorrect,
                feedbackItems
            );
        }
    };
} 