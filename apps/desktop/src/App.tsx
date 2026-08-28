import { useEffect, useState } from "react";
import Router from "./router";


function App(){
const [updateVersion, setUpdateVersion] = useState<string | null>(null);
const [downloaded, setDownloaded] = useState(false);

useEffect(() => {
	const updater = window.electronAPI?.updater;
	if (!updater) return;

	const removeAvailableListener = updater.onAvailable(({ version }) => {
		setUpdateVersion(version);
	});
	const removeDownloadedListener = updater.onDownloaded(({ version }) => {
		setUpdateVersion(version);
		setDownloaded(true);
	});

	return () => {
		removeAvailableListener();
		removeDownloadedListener();
	};
}, []);

return (
	<>
		<Router />
		{updateVersion && (
			<div className="fixed bottom-5 right-5 z-100 w-[min(380px,calc(100vw-2rem))] rounded-xl border border-blue-200 bg-white p-4 shadow-xl">
				<p className="font-semibold text-slate-800">
					{downloaded ? `Phiên bản ${updateVersion} đã sẵn sàng` : `Có phiên bản mới ${updateVersion}`}
				</p>
				<p className="mt-1 text-sm text-slate-500">
					{downloaded ? "Khởi động lại ứng dụng để cập nhật." : "Tải bản cập nhật mới từ GitHub."}
				</p>
				<div className="mt-3 flex justify-end gap-2">
					{!downloaded ? (
						<button
							type="button"
							className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
							onClick={() => window.electronAPI.updater.download()}
						>
							Tải cập nhật
						</button>
					) : (
						<button
							type="button"
							className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
							onClick={() => window.electronAPI.updater.install()}
						>
							Khởi động lại và cập nhật
						</button>
					)}
				</div>
			</div>
		)}
	</>
);

}


export default App;