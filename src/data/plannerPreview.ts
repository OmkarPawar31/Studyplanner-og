export type PlanBlock = {
  id: string;
  time: string;
  title: string;
  course: string;
  kind: 'study' | 'deadline' | 'class' | 'break';
  note?: string;
};

export const planDay = {
  label: 'Tuesday, Sep 15',
  headline: 'Two deadlines this week, so mornings go to the lab report.',
  focusHours: 4.5,
  deadlinesLeft: 2
};

export const planBlocks: PlanBlock[] = [
{
  id: 'b1',
  time: '8:30',
  title: 'Draft lab report intro',
  course: 'CHEM 201',
  kind: 'study',
  note: 'Moved earlier — you finish writing faster before noon.'
},
{
  id: 'b2',
  time: '10:00',
  title: 'Linear Algebra lecture',
  course: 'MATH 214',
  kind: 'class'
},
{
  id: 'b3',
  time: '12:15',
  title: 'Lunch + walk',
  course: '45 min',
  kind: 'break'
},
{
  id: 'b4',
  time: '1:00',
  title: 'Problem set 4 — due 11:59pm',
  course: 'MATH 214',
  kind: 'deadline',
  note: 'Split into 3 sittings so it lands with two hours to spare.'
},
{
  id: 'b5',
  time: '4:00',
  title: 'Reading: Chapters 6–7',
  course: 'HIST 108',
  kind: 'study'
}];