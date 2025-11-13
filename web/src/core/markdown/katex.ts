// Configuration for KaTeX rendering, used by both the renderer and the editor.
import type { Options as RehypeKatexOptions } from "rehype-katex";

// Optional: Import extensions if needed (e.g., for chemistry)
// import "katex/contrib/mhchem";

// Define custom LaTeX macros for convenience and standardization (Design Doc Ref: User Profile - Python/MATLAB user)
const macros = {
  // Linear Algebra
  "\\vect": "\\mathbf{#1}",
  "\\mat": "\\mathbf{#1}",
  // Calculus
  "\\grad": "\\nabla #1",
  "\\div": "\\nabla \\cdot #1",
  "\\curl": "\\nabla \\times #1",
  "\\dv": "\\frac{d #1}{d #2}",
  "\\pdv": "\\frac{\\partial #1}{\\partial #2}",
  "\\pdvN": "\\frac{\\partial^{#3} #1}{\\partial #2^{#3}}",
  // Brackets and Norms
  "\\abs": "\\left|#1\\right|",
  "\\norm": "\\left\\lVert#1\\right\\rVert",
  "\\set": "\\left\\{#1\\right\\}",
  // Quantum Mechanics (Dirac Notation)
  "\\bra": "\\left\\langle#1\\right|",
  "\\ket": "\\left|#1\\right\\rangle",
  "\\braket": "\\left\\langle#1\\middle|#2\\right\\rangle",
  // Structures
  "\\matrix": "\\begin{pmatrix}#1\\end{pmatrix}",
} as const;

export const katexOptions: RehypeKatexOptions = {
  macros,
  // 'ignore' allows rendering to continue even if there are minor LaTeX errors
  strict: "ignore",
  // Trust specific commands for advanced features if needed
  trust: (context) => context.command === "\\htmlClass" || context.command === "\\href",
  throwOnError: false,
};

export type KatexMacroKey = keyof typeof macros;
