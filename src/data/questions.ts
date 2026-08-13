import type { QuizQuestion } from '../types/planner';

export const questionBank: QuizQuestion[] = [
// Linear Algebra
{
  id: 'm1',
  subjectId: 'math',
  topic: 'Eigenvalues',
  prompt: 'A 3×3 matrix has eigenvalues 2, 2 and 5. What is its determinant?',
  options: ['9', '20', '25', '10'],
  answerIndex: 1,
  explanation: 'The determinant is the product of the eigenvalues: 2 × 2 × 5 = 20.',
  difficulty: 'core'
},
{
  id: 'm2',
  subjectId: 'math',
  topic: 'Eigenvalues',
  prompt: 'If λ is an eigenvalue of an invertible matrix A, what is the matching eigenvalue of A⁻¹?',
  options: ['λ', '−λ', '1/λ', 'λ²'],
  answerIndex: 2,
  explanation: 'From Av = λv, applying A⁻¹ gives A⁻¹v = (1/λ)v.',
  difficulty: 'applied'
},
{
  id: 'm3',
  subjectId: 'math',
  topic: 'Eigenvalues',
  prompt: 'A symmetric real matrix is guaranteed to have…',
  options: [
  'Only positive eigenvalues',
  'Real eigenvalues and orthogonal eigenvectors',
  'Distinct eigenvalues',
  'A zero determinant'],

  answerIndex: 1,
  explanation: 'The spectral theorem: real symmetric matrices have real eigenvalues and an orthogonal eigenbasis.',
  difficulty: 'stretch'
},
{
  id: 'm4',
  subjectId: 'math',
  topic: 'Vector spaces',
  prompt: 'What is the dimension of the space of 2×2 symmetric real matrices?',
  options: ['2', '3', '4', '6'],
  answerIndex: 1,
  explanation: 'Free entries are a₁₁, a₂₂ and the shared off-diagonal a₁₂ = a₂₁, so the dimension is 3.',
  difficulty: 'applied'
},
{
  id: 'm5',
  subjectId: 'math',
  topic: 'Vector spaces',
  prompt: 'A 4×6 matrix has rank 3. What is the dimension of its null space?',
  options: ['1', '2', '3', '4'],
  answerIndex: 2,
  explanation: 'Rank–nullity: 6 columns − rank 3 = nullity 3.',
  difficulty: 'core'
},
{
  id: 'm6',
  subjectId: 'math',
  topic: 'Determinants',
  prompt: 'Swapping two rows of a matrix changes its determinant how?',
  options: ['No change', 'Multiplies it by −1', 'Sets it to zero', 'Doubles it'],
  answerIndex: 1,
  explanation: 'A single row swap flips the sign of the determinant.',
  difficulty: 'core'
},
{
  id: 'm7',
  subjectId: 'math',
  topic: 'Determinants',
  prompt: 'For a 3×3 matrix A, det(2A) equals…',
  options: ['2·det(A)', '6·det(A)', '8·det(A)', 'det(A)'],
  answerIndex: 2,
  explanation: 'Scaling an n×n matrix by k scales the determinant by kⁿ, so 2³ = 8.',
  difficulty: 'applied'
},

// Organic Chemistry
{
  id: 'c1',
  subjectId: 'chem',
  topic: 'Reaction mechanisms',
  prompt: 'Which substrate reacts fastest under Sₙ1 conditions?',
  options: ['Methyl bromide', 'Primary bromide', 'Secondary bromide', 'Tertiary bromide'],
  answerIndex: 3,
  explanation: 'Sₙ1 rate follows carbocation stability, so tertiary is fastest.',
  difficulty: 'core'
},
{
  id: 'c2',
  subjectId: 'chem',
  topic: 'Reaction mechanisms',
  prompt: 'An Sₙ2 reaction at a stereocentre results in…',
  options: [
  'Retention of configuration',
  'Inversion of configuration',
  'A racemic mixture',
  'Loss of the stereocentre'],

  answerIndex: 1,
  explanation: 'Backside attack gives a single inverted product (Walden inversion).',
  difficulty: 'applied'
},
{
  id: 'c3',
  subjectId: 'chem',
  topic: 'Stereochemistry',
  prompt: 'Two compounds that are non-superimposable mirror images are called…',
  options: ['Diastereomers', 'Enantiomers', 'Conformers', 'Constitutional isomers'],
  answerIndex: 1,
  explanation: 'Mirror-image stereoisomers that cannot be superimposed are enantiomers.',
  difficulty: 'core'
},
{
  id: 'c4',
  subjectId: 'chem',
  topic: 'Stereochemistry',
  prompt: 'A molecule with 3 stereocentres has at most how many stereoisomers?',
  options: ['3', '6', '8', '9'],
  answerIndex: 2,
  explanation: '2ⁿ where n = 3 gives a maximum of 8 stereoisomers.',
  difficulty: 'applied'
},
{
  id: 'c5',
  subjectId: 'chem',
  topic: 'Spectroscopy',
  prompt: 'A strong IR absorption near 1715 cm⁻¹ most suggests…',
  options: ['O–H alcohol', 'C=O ketone', 'C≡N nitrile', 'C–H alkane'],
  answerIndex: 1,
  explanation: 'Carbonyl stretches appear around 1700–1750 cm⁻¹.',
  difficulty: 'core'
},
{
  id: 'c6',
  subjectId: 'chem',
  topic: 'Spectroscopy',
  prompt: 'In ¹H NMR, a signal splitting into a triplet indicates…',
  options: [
  'One neighbouring proton',
  'Two neighbouring protons',
  'Three neighbouring protons',
  'No neighbouring protons'],

  answerIndex: 1,
  explanation: 'The n+1 rule: a triplet means two equivalent neighbouring protons.',
  difficulty: 'applied'
},
{
  id: 'c7',
  subjectId: 'chem',
  topic: 'Spectroscopy',
  prompt: 'An M+2 peak roughly equal in height to M+ in mass spec suggests the presence of…',
  options: ['Chlorine', 'Bromine', 'Nitrogen', 'Fluorine'],
  answerIndex: 1,
  explanation: 'Bromine’s isotopes ⁷⁹Br and ⁸¹Br are near 1:1, giving equal M+ and M+2 peaks.',
  difficulty: 'stretch'
},

// Modern History
{
  id: 'h1',
  subjectId: 'hist',
  topic: 'Cold War',
  prompt: 'The Marshall Plan was primarily intended to…',
  options: [
  'Rebuild Western European economies',
  'Create a joint nuclear arsenal',
  'Partition Berlin',
  'Fund decolonisation movements'],

  answerIndex: 0,
  explanation: 'US aid aimed to rebuild Western Europe and limit the appeal of communism.',
  difficulty: 'core'
},
{
  id: 'h2',
  subjectId: 'hist',
  topic: 'Cold War',
  prompt: 'The Cuban Missile Crisis took place in which year?',
  options: ['1956', '1959', '1962', '1968'],
  answerIndex: 2,
  explanation: 'The thirteen-day standoff occurred in October 1962.',
  difficulty: 'core'
},
{
  id: 'h3',
  subjectId: 'hist',
  topic: 'Decolonisation',
  prompt: 'The Bandung Conference of 1955 is best known for…',
  options: [
  'Founding NATO',
  'Launching Afro-Asian non-alignment',
  'Ending the Korean War',
  'Creating the euro'],

  answerIndex: 1,
  explanation: 'It brought together newly independent Afro-Asian states and seeded the Non-Aligned Movement.',
  difficulty: 'applied'
},
{
  id: 'h4',
  subjectId: 'hist',
  topic: 'Decolonisation',
  prompt: 'Which of these gained independence earliest?',
  options: ['Ghana', 'India', 'Kenya', 'Algeria'],
  answerIndex: 1,
  explanation: 'India in 1947, ahead of Ghana (1957), Algeria (1962) and Kenya (1963).',
  difficulty: 'applied'
},
{
  id: 'h5',
  subjectId: 'hist',
  topic: 'Industrial change',
  prompt: 'A defining feature of the second industrial revolution was…',
  options: [
  'Water-powered textile mills',
  'Steel, chemicals and electrification',
  'Guild-based craft production',
  'Subsistence agriculture'],

  answerIndex: 1,
  explanation: 'From the 1870s, steel, chemicals and electric power drove industrial expansion.',
  difficulty: 'core'
},
{
  id: 'h6',
  subjectId: 'hist',
  topic: 'Industrial change',
  prompt: 'Fordism is most associated with…',
  options: [
  'Craft workshops',
  'Moving assembly lines and standardised output',
  'Cottage industry',
  'Guild apprenticeships'],

  answerIndex: 1,
  explanation: 'Fordism describes mass production on moving assembly lines with standardised parts.',
  difficulty: 'stretch'
}];