import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from '@tanstack/react-router'
import { useModelsStore } from '@/stores/models'
import { toast } from 'sonner'
import getApiKeyAiStudio from '@/assets/add-model-tutorial/2-get-api-key-ai-studio.png'
import createApiKeyButtonAiStudio from '@/assets/add-model-tutorial/3-create-api-key-button-ai-studio.png'
import createApiKeyInNewProjectAiStudio from '@/assets/add-model-tutorial/4-create-api-key-in-new-project-ai-studio.png'
import copyGeneratedKeyAiStudio from '@/assets/add-model-tutorial/5-copy-generted-key-ai-studio.png'

export const AddModelTutorial: React.FC = () => {
    const models = useModelsStore(state => state.models)
    const activeModels = useModelsStore(state => state.getActiveModels)()
    const addDefaultModel = useModelsStore(state => state.addDefaultModel)
    const [apiKey, setApiKey] = useState('')
    const hasModels = models.length > 0
    const hasActive = activeModels.length > 0

    const handleAddModel = () => {
        try {
            addDefaultModel(apiKey)
            toast.success('Model added successfully!')
            setApiKey('')
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to add model'
            toast.error(message)
        }
    }

    return (
        <>
            <div className="container mx-auto py-12 px-4 md:px-6 max-w-3xl">
                <h2 className="text-2xl font-bold mb-6 text-center">Get Started: Add Your AI Model</h2>
                <p className="text-center text-muted-foreground mb-10">
                    Follow these steps to connect your Google AI Studio model and create your first learning module.
                </p>

                {!hasModels && (
                    <Card className="mb-8 shadow-sm">
                        <CardHeader>
                            <CardTitle>Step 1: Get Your API Key from Google AI Studio</CardTitle>
                            <CardDescription>
                                You need an API key to allow MuscleCode to use your Google AI model.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                Visit the{' '}
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    Google AI Studio
                                </a>{' '}
                                website and sign in.
                            </p>
                            <p>
                                Click on <span className="font-semibold">'Get API key'</span> in the navigation menu.
                            </p>
                            <div className="border rounded-lg overflow-hidden mx-auto mt-2 mb-4">
                                <img
                                    src={getApiKeyAiStudio}
                                    alt="Google AI Studio - 'Get API Key' button location in sidebar"
                                    className="object-contain w-full h-auto max-w-full"
                                />
                            </div>
                            <p>
                                Click the <span className="font-semibold">'Create API key'</span> button.
                            </p>
                            <div className="border rounded-lg overflow-hidden mx-auto mt-2 mb-4">
                                <img
                                    src={createApiKeyButtonAiStudio}
                                    alt="Google AI Studio - 'Create API Key' button"
                                    className="object-contain w-full h-auto max-w-full"
                                />
                            </div>
                            <p>
                                Choose an existing project or select{' '}
                                <span className="font-semibold">'Create API key in new project'</span>.
                            </p>
                            <div className="border rounded-lg overflow-hidden mx-auto mt-2 mb-4">
                                <img
                                    src={createApiKeyInNewProjectAiStudio}
                                    alt="Google AI Studio - 'Create API key in new project' option"
                                    className="object-contain w-full h-auto max-w-full"
                                />
                            </div>
                            <p>
                                Once the key is generated, click the copy icon to copy it to your clipboard.{' '}
                                <span className="font-semibold">Keep this key secure!</span>
                            </p>
                            <div className="border rounded-lg overflow-hidden mx-auto mt-2">
                                <img
                                    src={copyGeneratedKeyAiStudio}
                                    alt="Google AI Studio - Copy generated API key"
                                    className="object-contain w-full h-auto max-w-full"
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {hasModels && !hasActive && (
                    <Card className="mb-8 shadow-sm">
                        <CardHeader>
                            <CardTitle>Activate Your Model</CardTitle>
                            <CardDescription>
                                You have configured models but none are active.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>
                                Please activate your model in{' '}
                                <Link to="/settings/models" className="text-blue-600 hover:underline">
                                    Models Settings
                                </Link>
                                .
                            </p>
                        </CardContent>
                    </Card>
                )}

                {hasActive && (
                    <Card className="mb-8 shadow-sm">
                        <CardHeader>
                            <CardTitle>Step 2: Create Your First Learning Module</CardTitle>
                            <CardDescription>
                                With your model connected, you can now generate learning content.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>
                                Go to the{' '}
                                <Link to="/learning/modules" className="text-blue-600 hover:underline">
                                    Modules
                                </Link>{' '}
                                page.
                            </p>
                            <p>
                                Use the chat interface to tell the AI what kind of module you want. Be specific!
                            </p>
                            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto">
                                <code>
                                    Create a learning module about the basics of React Hooks for beginners. Cover
                                    useState and useEffect with simple code examples and include a short quiz.
                                </code>
                            </pre>
                            <p>Send your message. The AI will use your connected model to generate the module content.</p>
                            <p>Review the generated content. You can ask the AI for changes or save your new module!</p>
                        </CardContent>
                    </Card>
                )}

                {hasActive && (
                    <div className="text-center">
                        <p className="text-lg font-semibold mb-4">Ready to create?</p>
                        <Button asChild size="lg">
                            <Link to="/learning/modules">Go to Modules Page</Link>
                        </Button>
                    </div>
                )}
            </div>

            {/* Input key */}
            {!hasActive && (
                <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none z-50">
                    <div className="w-full max-w-3xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-4 shadow-lg rounded-t-lg pointer-events-auto">
                        <div className="flex items-center space-x-3">
                            {!hasModels && (
                                <form
                                    className="flex items-center space-x-3 w-full"
                                    onSubmit={e => {
                                        e.preventDefault()
                                        handleAddModel()
                                    }}
                                >
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mr-2 shrink-0 whitespace-nowrap">
                                        Get your key from{' '}
                                        <a
                                            href="https://aistudio.google.com/app/apikey"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            Google AI Studio
                                        </a>
                                        .
                                    </p>
                                    <Input
                                        className="flex-grow"
                                        placeholder="Enter API Key"
                                        value={apiKey}
                                        autoComplete="off"
                                        type="password"
                                        onChange={e => setApiKey(e.target.value)}
                                    />
                                    <Button type="submit">Add Key</Button>
                                </form>
                            )}
                            {hasModels && !hasActive && (
                                <>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        You have models but none are active.
                                    </p>
                                    <Button asChild>
                                        <Link to="/settings/models">Activate Model</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
} 