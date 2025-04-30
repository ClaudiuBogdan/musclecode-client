import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router'; // Import Link from Tanstack Router

// Import tutorial images with updated names
import addNewModelMuscleCode from '@/assets/add-model-tutorial/1-add-new-model-musclecode.png';
import getApiKeyAiStudio from '@/assets/add-model-tutorial/2-get-api-key-ai-studio.png';
import createApiKeyButtonAiStudio from '@/assets/add-model-tutorial/3-create-api-key-button-ai-studio.png';
import createApiKeyInNewProjectAiStudio from '@/assets/add-model-tutorial/4-create-api-key-in-new-project-ai-studio.png';
import copyGeneratedKeyAiStudio from '@/assets/add-model-tutorial/5-copy-generted-key-ai-studio.png'; // Note: typo in filename 'generted'
import addNewModelFormMuscleCode from '@/assets/add-model-tutorial/6-add-new-model-form-musclecode.png';


export const AddModelTutorial = () => {
    return (
        <div className="container mx-auto py-12 px-4 md:px-6 max-w-3xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Get Started: Add Your AI Model</h2>
            <p className="text-center text-muted-foreground mb-10">Follow these steps to connect your Google AI Studio model and create your first learning module.</p>

            {/* Step 1: Go to AI Studio */}
            <Card className="mb-8 shadow-sm">
                <CardHeader>
                    <CardTitle>Step 1: Get Your API Key from Google AI Studio</CardTitle>
                    <CardDescription>
                        You need an API key to allow MuscleCode to use your Google AI model.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>
                        Visit the <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a> website and sign in.
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
                        Choose an existing project or select <span className="font-semibold">'Create API key in new project'</span>.
                    </p>
                    <div className="border rounded-lg overflow-hidden mx-auto mt-2 mb-4">
                        <img
                            src={createApiKeyInNewProjectAiStudio}
                            alt="Google AI Studio - 'Create API key in new project' option"
                            className="object-contain w-full h-auto max-w-full"
                        />
                    </div>
                    <p>
                        Once the key is generated, click the copy icon to copy it to your clipboard. <span className="font-semibold">Keep this key secure!</span>
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

            {/* Step 2: Add Model in MuscleCode */}
            <Card className="mb-8 shadow-sm">
                <CardHeader>
                    <CardTitle>Step 2: Add Your Model in MuscleCode</CardTitle>
                    <CardDescription>
                        Now, let's add the model details to this application.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>
                        Navigate to the <Link to="/settings/models" className="text-blue-600 hover:underline">Models</Link> page in MuscleCode (usually via the sidebar or top navigation).
                    </p>
                     <p>
                        Click the <span className="font-semibold">'+ Add New Model'</span> button.
                    </p>
                     <div className="border rounded-lg overflow-hidden mx-auto mt-2 mb-4">
                        <img
                            src={addNewModelMuscleCode}
                            alt="MuscleCode - Add New Model button in Models page"
                            className="object-contain w-full h-auto max-w-full"
                         />
                    </div>
                    <p>
                        In the form that appears:
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li>Give your model a recognizable <span className="font-semibold">Name</span> (e.g., "My Gemini Pro").</li>
                        <li>Paste the <span className="font-semibold">API Key</span> you copied from Google AI Studio.</li>
                    </ul>
                    <div className="border rounded-lg overflow-hidden mx-auto mt-2 mb-4">
                        <img
                            src={addNewModelFormMuscleCode}
                            alt="MuscleCode - Add New Model form with Name and API Key fields"
                            className="object-contain w-full h-auto max-w-full"
                         />
                    </div>
                    <p>
                        Click <span className="font-semibold">'Save Model'</span>.
                    </p>
                </CardContent>
            </Card>

            {/* Step 3: Create Module */}
            <Card className="mb-8 shadow-sm">
                <CardHeader>
                    <CardTitle>Step 3: Create Your First Learning Module</CardTitle>
                    <CardDescription>
                        With your model connected, you can now generate learning content.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>
                        Go to the <Link to="/learning/modules" className="text-blue-600 hover:underline">Modules</Link> page.
                    </p>
                    <p>
                        Use the chat interface to tell the AI what kind of module you want. Be specific! For example:
                    </p>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto">
                        <code>
                            Create a learning module about the basics of React Hooks for beginners. Cover useState and useEffect with simple code examples and include a short quiz.
                        </code>
                    </pre>
                    {/* Optional: Add image placeholder if you have one for the modules chat interface */}
                    {/* <div className="border rounded-lg overflow-hidden max-w-[800px] mx-auto">
                         <img
                            src={image_for_modules_chat} // Replace with actual image import
                            alt="MuscleCode - Modules page chat interface"
                            className="object-contain w-full h-auto"
                        />
                    </div> */}
                    <p>
                        Send your message. The AI will use your connected model to generate the module content.
                    </p>
                     <p>
                        Review the generated content. You can ask the AI for changes or save your new module!
                    </p>
                </CardContent>
            </Card>

            {/* Final CTA */}
            <div className="text-center">
                <p className="text-lg font-semibold mb-4">Ready to create?</p>
                <Button asChild size="lg">
                    {/* Use Tanstack Router Link */}
                    <Link to="/learning/modules">
                        Go to Modules Page
                    </Link>
                </Button>
            </div>
        </div>
    );
}; 