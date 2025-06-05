

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
export async function trackInteraction(
    nodeId: string,
    interactionId: string,
    interactionType: string,
    interactionData: Record<string, any>,
    config: InteractionConfig = {}
): Promise<void> {
    const {
        errorMessage = 'Failed to save your interaction. Your progress may not be recorded.',
        showErrorToast = true
    } = config;

    try {
        const interaction: InteractionDataDto = {
            id: interactionId,
            type: interactionType,
            data: interactionData
        };

        const payload: InteractionRequestDto = {
            nodeId,
            interaction
        };

        await sendInteraction(payload);

        logger.debug('Interaction tracked successfully', {
            nodeId,
            interactionType,
            interactionId: interaction.id
        });

    } catch (error) {
        logger.error('Failed to track interaction', {
            nodeId,
            interactionType,
            error: error instanceof Error ? error.message : String(error)
        });

        // Show error toast unless explicitly disabled
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
    const interactionId = itemId;
    return trackInteraction(
        nodeId,
        interactionId,
        'quiz_answer',
        {
            selectedOption,
            isCorrect,
            timestamp: new Date().toISOString()
        }
    );
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
    maxScore?: number
): Promise<void> {
    const interactionId = questionId;
    return trackInteraction(
        nodeId,
        interactionId,
        'question_submit',
        {
            userAnswer: userAnswer.substring(0, 1000), // Limit length for storage
            score,
            maxScore,
            timestamp: new Date().toISOString()
        }
    );
}

/**
 * Hook-based version that uses React Query mutation for component integration
 * This provides more React-friendly state management if needed
 */
export function useInteractionTracker() {
    const trackAsync = (
        nodeId: string,
        interactionId: string,
        interactionType: string,
        interactionData: Record<string, any> = {},
        config: InteractionConfig = {}
    ) => {
        // Run in background without blocking
        void trackInteraction(nodeId, interactionId, interactionType, interactionData, config);
    };

    return {
        track: trackAsync,
        trackQuiz: (
            nodeId: string,
            interactionId: string,
            selectedOption: number,
            isCorrect: boolean,
        ) => {
            trackAsync(nodeId, interactionId, 'quiz_answer', {
                selectedOption,
                isCorrect,
                timestamp: new Date().toISOString()
            });
        },
        trackQuestion: (
            nodeId: string,
            questionId: string,
            userAnswer: string,
            score?: number,
            maxScore?: number
        ) => {
            trackAsync(nodeId, questionId, 'question_submit', {
                userAnswer: userAnswer.substring(0, 1000),
                score,
                maxScore,
                timestamp: new Date().toISOString()
            });
        }
    };
} 