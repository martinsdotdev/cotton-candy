import { Workspace } from "@/components/workspace"

export default function Page() {
	const qualquermMerda = async () => {
		const response = await fetch('/api', {
			method: 'POST',
			body: JSON.stringify({
				text: `Eu \${instrucao}desenhar um quadrado\${instrucao}.
Eu sou o \${identifica}Pedro\${identifica}, gostaria de \${instrucao}desenhar um quadrado\${instrucao}
 e \${identifica}Thomas\${identifica} quer \${instrucao}depois um círculo\${instrucao}.`
			}),
		})

		const result = await response.json()
		console.log(result)
	}

	return (
		<div className="flex h-svh flex-col p-6">
			<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4">
				<h1 className="text-lg font-medium">Cotton Candy</h1>
				<Workspace />
			</div>
		</div>
	)
}
