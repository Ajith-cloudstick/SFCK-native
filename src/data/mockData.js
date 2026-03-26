// Helper to generate a random number within a range
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const firstNames = ['Rajan', 'Soman', 'Gopi', 'Babu', 'Mohan', 'Suresh', 'Ramesh', 'Ravi', 'Unni', 'Hari', 'Radha', 'Latha', 'Mini', 'Saly', 'Bindu', 'Maya', 'Geetha', 'Sriya', 'Anil', 'Praman', 'Biju', 'Manoj', 'Sree', 'Deepa', 'Resmi', 'Anu', 'Jyothi', 'Kala', 'Sindhu', 'Ajith'];
const lastNames = ['K.', 'T.', 'Menon', 'Nair', 'Pillai', 'V.', 'R.', 'S.', 'M.', 'P.', 'C.', 'Kumar', 'Das', 'Varma'];

export const ESTATES = [
  { id: 'Cherumppittakavu', name: 'Cherumppittakavu', startId: 3201, count: 200, range: '3201 – 3400' },
  { id: 'Kumaramkudy', name: 'Kumaramkudy', startId: 3501, count: 200, range: '3501 – 3700' },
  { id: 'Mullumala', name: 'Mullumala', startId: 3801, count: 200, range: '3801 – 4000' },
  { id: 'Chithalvetty', name: 'Chithalvetty', startId: 4101, count: 200, range: '4101 – 4300' },
];

const generateEmployees = (estateName, startId, count) => {
  const employees = [];
  for (let i = 0; i < count; i++) {
    const fn = firstNames[rand(0, firstNames.length - 1)];
    const ln = lastNames[rand(0, lastNames.length - 1)];
    employees.push({
      id: (startId + i).toString(),
      name: `${fn} ${ln}`,
      initials: `${fn.charAt(0)}${ln.charAt(0)}`,
      estate: estateName,
      status: 'pending', // 'pending' | 'present'
      isLate: false,
      block: null,
    });
  }
  return employees;
};

export const INITIAL_EMPLOYEES = [
  ...generateEmployees('Cherumppittakavu', 3201, 200),
  ...generateEmployees('Kumaramkudy', 3501, 200),
  ...generateEmployees('Mullumala', 3801, 200),
  ...generateEmployees('Chithalvetty', 4101, 200),
];

export const INITIAL_WORK_ITEMS = [
  { id: 'B-1A', type: 'tapping', estate: 'Cherumppittakavu', blockName: 'North sector', trees: 240, assignedEmpIds: [], isCrossPosted: false },
  { id: 'B-2C', type: 'tapping', estate: 'Cherumppittakavu', blockName: 'West ridge', trees: 180, assignedEmpIds: [], isCrossPosted: false },
  { id: 'B-3B', type: 'tapping', estate: 'Chithalvetty', blockName: 'South slope', trees: 210, assignedEmpIds: [], isCrossPosted: true },
  { id: 'B-4A', type: 'tapping', estate: 'Kumaramkudy', blockName: 'Hill east', trees: 195, assignedEmpIds: [], isCrossPosted: false },
  { id: 'GW-01', type: 'general', estate: 'Cherumppittakavu', category: 'Security', assignedEmpIds: [], isCrossPosted: false },
  { id: 'GW-02', type: 'general', estate: 'Cherumppittakavu', category: 'Cleaning', assignedEmpIds: [], isCrossPosted: false },
];
