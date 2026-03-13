import { Workspace } from "@/components/workspace"

export default function Page() {
	return (
		<div className="flex h-svh flex-col p-6">
			<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4">
				<h1 className="text-lg font-medium">Cotton Candy</h1>
				<Workspace />
			</div>
		</div>
	)
}
