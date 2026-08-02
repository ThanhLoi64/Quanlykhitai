import { Sparkles } from "lucide-react";

export default function BrokenWatching() {
    return (
        <div className="flex items-center justify-center h-full px-6">
            <div className="max-w-md text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 shadow-md">
                    <Sparkles className="h-10 w-10 text-indigo-600 animate-pulse" />
                </div>

                <h1 className="text-3xl font-extrabold text-slate-800">
                    🚀 Tính năng sắp ra mắt
                </h1>

                <p className="mt-3 text-slate-500 leading-relaxed">
                    Chúng tôi đang hoàn thiện tính năng này để mang đến trải nghiệm
                    tốt nhất. Hãy quay lại trong thời gian tới!
                </p>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200">
                    <Sparkles className="h-4 w-4" />
                    Coming Soon
                </div>
            </div>
        </div>
    );
}