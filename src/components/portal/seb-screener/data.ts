import { SEBCategory, SEBCombinedCategory } from './types';

// Full screener categories with questions
export const sebCategories: SEBCategory[] = [
  {
    id: 'aggression',
    title: 'Aggression',
    description: 'This section is about behavior that may cause harm to people, animals, or property.',
    questions: [
      {
        id: 'aggression_1',
        question: 'Arguments or conflicts end in physical fighting, pushing, hitting, or bullying behaviors (in person or online).',
      },
      {
        id: 'aggression_2',
        question: 'When upset, has damaged property (slamming doors, breaking items, throwing objects, punching walls, ripping materials).',
      },
      {
        id: 'aggression_3',
        question: 'Has made serious threats to hurt someone (examples: "I am going to hurt you," "I will kill you," "I want to kill someone").',
        isRedFlag: true,
      },
      {
        id: 'aggression_4',
        question: 'Has acted aggressively toward an animal (examples: hitting, kicking, choking, throwing, tormenting, or intentionally hurting an animal).',
        isRedFlag: true,
      },
    ],
  },
  {
    id: 'rule_breaking',
    title: 'Rule-Breaking / Conduct',
    description: 'This section is about repeated rule-breaking that causes school or home problems.',
    questions: [
      {
        id: 'conduct_1',
        question: 'Has taken things that are not theirs or lied to avoid consequences (examples: stealing from stores, home, school, or taking money or items).',
      },
      {
        id: 'conduct_2',
        question: 'Has skipped school without permission or repeatedly refused to go, or has left home without telling an adult where they are going.',
        isRedFlag: true,
      },
      {
        id: 'conduct_3',
        question: 'Gets frequent reports from school about ignoring rules, refusing directions, or repeated disciplinary issues.',
      },
      {
        id: 'conduct_4',
        question: 'Has intentionally damaged their own belongings or someone else\'s belongings.',
      },
    ],
  },
  {
    id: 'hyperactivity',
    title: 'Hyperactivity',
    description: 'This section is about constant movement and restlessness beyond what is typical for age.',
    questions: [
      {
        id: 'hyperactivity_1',
        question: 'Fidgets constantly (hands, feet, tapping, rocking) or looks "driven by a motor."',
      },
      {
        id: 'hyperactivity_2',
        question: 'Has trouble staying seated when expected (meals, homework, class, appointments).',
      },
      {
        id: 'hyperactivity_3',
        question: 'Rushes through tasks and makes careless mistakes because they are moving too fast.',
      },
      {
        id: 'hyperactivity_4',
        question: 'Talks excessively or has difficulty waiting for a turn to speak.',
      },
    ],
  },
  {
    id: 'impulsivity',
    title: 'Impulsivity',
    description: 'This section is about acting quickly without pausing, even when it causes problems.',
    questions: [
      {
        id: 'impulsivity_1',
        question: 'Blurts out comments or answers without thinking.',
      },
      {
        id: 'impulsivity_2',
        question: 'Interrupts others or talks over them repeatedly.',
      },
      {
        id: 'impulsivity_3',
        question: 'Has trouble stopping an action once started (keeps going even after reminders or consequences).',
      },
      {
        id: 'impulsivity_4',
        question: 'Does risky things without thinking about the outcome (examples: unsafe climbing, running off, touching hot items, unsafe online choices).',
      },
    ],
  },
  {
    id: 'inattention',
    title: 'Inattention',
    description: 'This section is about focus, remembering directions, and finishing tasks.',
    questions: [
      {
        id: 'inattention_1',
        question: 'Is easily pulled off task by noises, people, screens, or things happening nearby.',
      },
      {
        id: 'inattention_2',
        question: 'Has difficulty staying focused long enough to finish tasks (homework, chores, reading, directions).',
      },
      {
        id: 'inattention_3',
        question: 'Forgets directions or what they just learned (needs repeated reminders, loses steps, forgets multi-step instructions).',
      },
      {
        id: 'inattention_4',
        question: 'Does not check work and misses obvious errors (skips steps, turns in incomplete work, does not notice mistakes).',
      },
    ],
  },
  {
    id: 'anxiety',
    title: 'Anxiety',
    description: 'This section is about worry or fear that gets in the way of daily life.',
    questions: [
      {
        id: 'anxiety_1',
        question: 'Seems overly worried or fearful (asks repeated "what if" questions, needs constant reassurance, fears separation).',
      },
      {
        id: 'anxiety_2',
        question: 'Says their mind will not slow down or they cannot stop worrying (example: "I cannot turn my thoughts off").',
      },
      {
        id: 'anxiety_3',
        question: 'Avoids tasks due to fear of mistakes (refuses to start, tears up work, needs it "perfect").',
      },
      {
        id: 'anxiety_4',
        question: 'Shows strong physical signs of fear in certain situations (trembling, stomachaches, crying, panic, freezing).',
      },
    ],
  },
  {
    id: 'depression',
    title: 'Depression',
    description: "This section is about low mood and loss of interest compared to the child's usual self.",
    questions: [
      {
        id: 'depression_1',
        question: 'Talks about feeling sad, empty, lonely, or hopeless.',
      },
      {
        id: 'depression_2',
        question: 'Has lost interest in activities they used to enjoy (friends, hobbies, sports, games).',
      },
      {
        id: 'depression_3',
        question: 'Cries easily or frequently compared to their usual self.',
      },
      {
        id: 'depression_4',
        question: 'Sleep changes that are significant (sleeping much more than usual, trouble falling asleep, waking often, early waking).',
      },
    ],
  },
  {
    id: 'somatic',
    title: 'Somatic Complaints',
    description: 'This section is about frequent physical complaints that often increase with stress.',
    questions: [
      {
        id: 'somatic_1',
        question: 'Frequent complaints like stomachaches or headaches, and medical checks do not explain it clearly.',
      },
      {
        id: 'somatic_2',
        question: 'Says they feel sick to avoid school, tasks, or stressful situations (even when there is no clear illness).',
      },
      {
        id: 'somatic_3',
        question: 'Regression in toileting or physical control (bedwetting after being dry, daytime accidents).',
      },
    ],
  },
  {
    id: 'withdrawal',
    title: 'Withdrawal',
    description: 'This section is about avoiding people or activities more than expected.',
    questions: [
      {
        id: 'withdrawal_1',
        question: 'Avoids social interaction (stays alone, avoids groups, does not want to engage with peers or adults).',
      },
      {
        id: 'withdrawal_2',
        question: 'Talks normally at home but becomes very quiet, freezes, or cannot speak in certain settings (school, public places, unfamiliar people).',
      },
      {
        id: 'withdrawal_3',
        question: 'Has stopped joining activities they used to do, or frequently isolates from friends.',
      },
    ],
  },
  {
    id: 'social_skills',
    title: 'Social Skills',
    description: 'This section is about peer interaction challenges that create repeated misunderstandings or conflict.',
    questions: [
      {
        id: 'social_1',
        question: 'Often misunderstands social cues (does not notice when someone is annoyed, stands too close, misses facial expressions or tone).',
      },
      {
        id: 'social_2',
        question: 'Has trouble starting conversations, keeping conversations going, or staying on topic.',
      },
      {
        id: 'social_3',
        question: 'Has difficulty working with others (sharing control, taking turns, compromising, handling group roles).',
      },
      {
        id: 'social_4',
        question: 'Avoids attention or shuts down when singled out (refuses to present, becomes upset when called on, avoids being the center of attention).',
      },
    ],
  },
  {
    id: 'emotional_regulation',
    title: 'Emotional Regulation and Adaptability',
    description: 'This section is about big reactions and difficulty adjusting to changes.',
    questions: [
      {
        id: 'emotional_1',
        question: 'Tantrums or meltdowns last much longer than expected for their age (takes a long time to calm even with support).',
      },
      {
        id: 'emotional_2',
        question: 'Becomes very upset by small changes (different route, substitute teacher, schedule change, change in plans).',
      },
      {
        id: 'emotional_3',
        question: 'Gets stuck and cannot adjust even after reminders (rigid about routines, order, or how things must be done).',
      },
      {
        id: 'emotional_4',
        question: 'Has trouble naming feelings or calming down once emotions escalate (may go from calm to very upset quickly).',
      },
    ],
  },
  {
    id: 'executive_skills',
    title: 'Executive Skills',
    description: 'This section is about organizing, starting tasks, planning, and switching activities.',
    questions: [
      {
        id: 'executive_1',
        question: 'Frequently loses items or has a messy backpack, desk, or workspace that interferes with work.',
      },
      {
        id: 'executive_2',
        question: 'Has trouble planning ahead (forgets deadlines, needs reminders for steps, struggles to manage time).',
      },
      {
        id: 'executive_3',
        question: 'Has difficulty starting tasks without repeated prompts (stares, delays, says "I do not know where to start").',
      },
      {
        id: 'executive_4',
        question: 'Has difficulty switching from one activity to another without conflict or shutdown (transitions are hard even with warnings).',
      },
    ],
  },
  {
    id: 'daily_living',
    title: 'Daily Living and Safety',
    description: 'This section is about self-care, responsibility for belongings, and basic safety awareness.',
    questions: [
      {
        id: 'daily_1',
        question: 'Needs more help than expected with basic self-care (dressing, hygiene, eating routines) for their age.',
      },
      {
        id: 'daily_2',
        question: 'Has difficulty managing personal items (loses materials, cannot keep track of essentials, forgets what they need).',
      },
      {
        id: 'daily_3',
        question: 'Poor safety awareness (runs into parking lots, approaches strangers without caution, ignores basic safety rules).',
        isRedFlag: true,
      },
    ],
  },
  {
    id: 'repetitive_unusual',
    title: 'Unusual Experiences or Repetitive Behaviors',
    description: 'This section is about experiences or repeated behaviors that stand out and may need follow-up.',
    questions: [
      {
        id: 'unusual_1',
        question: 'Repetitive movements or behaviors that others notice (hand flapping, rocking, spinning, pacing, repeating the same action).',
      },
      {
        id: 'unusual_2',
        question: 'Has told you they hear sounds or voices, or see things that you do not hear or see.',
        isRedFlag: true,
      },
      {
        id: 'unusual_3',
        question: 'Speech or thoughts can seem hard to follow (jumps topics quickly, makes connections others do not understand, seems confused when explaining).',
      },
      {
        id: 'unusual_4',
        question: 'Often acts much younger than expected for their age in everyday situations (baby talk, very immature play, needing comfort typical of much younger children).',
      },
    ],
  },
];

// Combined categories for parent-facing results
export const combinedCategories: SEBCombinedCategory[] = [
  {
    id: 'safety_behavior',
    title: 'Safety and Behavior',
    description: 'Concerns about harm risk or serious conflict',
    subcategories: ['aggression', 'rule_breaking'],
  },
  {
    id: 'attention_self_control',
    title: 'Attention and Self-Control',
    description: 'Distraction, hyperactivity, or impulsivity affecting learning or routines',
    subcategories: ['hyperactivity', 'impulsivity', 'inattention'],
  },
  {
    id: 'feelings_stress',
    title: 'Feelings and Stress',
    description: 'Worry, fear, or low mood getting in the way',
    subcategories: ['anxiety', 'depression', 'somatic'],
  },
  {
    id: 'social_connection',
    title: 'Social Connection',
    description: 'Difficulty connecting socially or communicating with others',
    subcategories: ['withdrawal', 'social_skills'],
  },
  {
    id: 'flexibility_independence',
    title: 'Flexibility and Independence',
    description: 'Emotional regulation, change adaptation, organization, or daily independence',
    subcategories: ['emotional_regulation', 'executive_skills', 'daily_living'],
  },
  {
    id: 'repetitive_unusual',
    title: 'Repetitive Behaviors or Unusual Experiences',
    description: 'Repetitive behaviors or experiences that may need follow-up',
    subcategories: ['repetitive_unusual'],
  },
];

// Brief screener questions
export const briefScreenerQuestions = [
  {
    id: 'safety_behavior',
    title: 'Safety and Behavior',
    question: 'Likely to have safety or behavior concerns that cause harm risk or serious conflict',
    examples: 'Examples: physical fighting, bullying, threats, damaging property when upset, aggressive behavior toward an animal.',
    requiresFollowUp: true,
  },
  {
    id: 'attention_self_control',
    title: 'Attention and Self-Control',
    question: 'Likely to be distracted, hyperactive, or impulsive in a way that interferes with learning or daily routines',
    examples: 'Examples: cannot stay seated, constantly fidgets, blurts out, interrupts, rushes work, forgets steps, loses focus quickly.',
  },
  {
    id: 'feelings_stress',
    title: 'Feelings and Stress',
    question: 'Likely to have worry, fear, or low mood that gets in the way',
    examples: 'Examples: excessive worrying, avoiding tasks due to fear of mistakes, frequent sadness or irritability, sleep changes, stress-related stomachaches or headaches.',
  },
  {
    id: 'social_connection',
    title: 'Social Connection',
    question: 'Likely to have ongoing difficulty connecting socially or communicating smoothly with others',
    examples: 'Examples: withdraws, avoids peers, trouble starting or keeping conversations, misses social cues, frequent misunderstandings or peer conflict.',
  },
  {
    id: 'flexibility_independence',
    title: 'Flexibility and Independence',
    question: 'Likely to struggle with emotional regulation, change, organization, or day-to-day independence',
    examples: 'Examples: big reactions that take a long time to calm, gets stuck on routines, trouble starting tasks, disorganized, loses items, needs more help than expected with daily routines.',
  },
  {
    id: 'repetitive_unusual',
    title: 'Repetitive Behaviors or Unusual Experiences',
    question: 'Likely to show repetitive behaviors or report experiences that seem unusual and may need follow-up',
    examples: 'Examples: repetitive movements (rocking, pacing, hand movements), repeated behaviors that others notice, tells you they hear or see things you do not, speech or thoughts are hard to follow.',
    requiresFollowUp: true,
  },
];

export const ratingOptions = [
  { value: 0, label: 'Never', description: 'Has not happened in the past 8 weeks' },
  { value: 1, label: 'Sometimes', description: 'Happened a few times' },
  { value: 2, label: 'Often', description: 'Happens weekly or regularly' },
  { value: 3, label: 'Almost Always', description: 'Happens most days or in most settings' },
];

export const briefRatingOptions = [
  { value: 0, label: 'Not at all likely' },
  { value: 1, label: 'Slightly likely' },
  { value: 2, label: 'Likely' },
  { value: 3, label: 'Very likely' },
];
