import { AddModelTutorial } from "./AddModelTutorial";

export const NoModulesAvailable = () => {
    return (
        <div className="text-center py-12 max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold mb-2">No Modules Available</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
                There are currently no learning modules available. Create a new module to get started.
            </p>

            <AddModelTutorial />
        </div>
    );
};