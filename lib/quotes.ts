/**
 * 동기부여 명언 — 실명 + 출처 명확.
 * 영어는 한국어 번역 같이.
 */

export interface Quote {
  text: string;           // 원문 (한국어 명언은 한국어, 외국 명언은 원문)
  translation?: string;   // 외국 명언의 한국어 번역
  author: string;
  source: string;
}

export const QUOTES: Quote[] = [
  // ─── Steve Jobs ───
  {
    text: "Stay hungry, stay foolish.",
    translation: "늘 갈망하고, 늘 우직하게.",
    author: "Steve Jobs",
    source: "Stanford 졸업 연설 (2005)",
  },
  {
    text: "Your time is limited, so don't waste it living someone else's life.",
    translation: "시간은 한정돼 있다. 그러니 남의 인생을 사느라 낭비하지 마라.",
    author: "Steve Jobs",
    source: "Stanford 졸업 연설 (2005)",
  },
  {
    text: "The only way to do great work is to love what you do.",
    translation: "위대한 일을 하는 유일한 방법은 자신이 하는 일을 사랑하는 것이다.",
    author: "Steve Jobs",
    source: "Stanford 졸업 연설 (2005)",
  },
  {
    text: "You can't connect the dots looking forward; you can only connect them looking backwards.",
    translation: "점들을 미리 연결할 수는 없다. 돌이켜봐야만 연결된다.",
    author: "Steve Jobs",
    source: "Stanford 졸업 연설 (2005)",
  },
  {
    text: "Death is very likely the single best invention of life. It's life's change agent.",
    translation: "죽음은 삶이 만든 최고의 발명품이다. 삶을 바꾸는 변화의 동력이다.",
    author: "Steve Jobs",
    source: "Stanford 졸업 연설 (2005)",
  },
  {
    text: "Don't let the noise of others' opinions drown out your own inner voice.",
    translation: "남들의 의견에 휘둘려 내면의 목소리를 잃지 마라.",
    author: "Steve Jobs",
    source: "Stanford 졸업 연설 (2005)",
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    translation: "혁신은 리더와 추종자를 가른다.",
    author: "Steve Jobs",
    source: "BusinessWeek 인터뷰 (2004)",
  },
  {
    text: "Design is not just what it looks like and feels like. Design is how it works.",
    translation: "디자인은 보이는 것과 느낌이 아니라, 어떻게 작동하는가의 문제다.",
    author: "Steve Jobs",
    source: "NYT Magazine 'The Guts of a New Machine' (2003)",
  },

  // ─── J.K. Rowling ───
  {
    text: "It is impossible to live without failing at something, unless you live so cautiously that you might as well not have lived at all.",
    translation: "실패 없이 산다는 건 불가능하다. 아주 조심스럽게 살아서 사는 것도 아닌 것처럼 살지 않는 한.",
    author: "J.K. Rowling",
    source: "Harvard 졸업 연설 (2008)",
  },
  {
    text: "Rock bottom became the solid foundation on which I rebuilt my life.",
    translation: "바닥이 곧 내가 내 인생을 다시 세운 단단한 기반이 됐다.",
    author: "J.K. Rowling",
    source: "Harvard 졸업 연설 (2008)",
  },
  {
    text: "We do not need magic to transform our world; we carry all of the power we need inside ourselves already.",
    translation: "세상을 바꾸는 데 마법은 필요 없다. 우리에게 필요한 힘은 이미 우리 안에 있다.",
    author: "J.K. Rowling",
    source: "Harvard 졸업 연설 (2008)",
  },

  // ─── Albert Einstein ───
  {
    text: "Imagination is more important than knowledge.",
    translation: "상상력은 지식보다 중요하다.",
    author: "Albert Einstein",
    source: "On Cosmic Religion (1931)",
  },
  {
    text: "Try not to become a man of success, but rather try to become a man of value.",
    translation: "성공한 사람이 되려 하지 말고 가치 있는 사람이 되려 하라.",
    author: "Albert Einstein",
    source: "LIFE 잡지 인터뷰 (1955)",
  },
  {
    text: "It's not that I'm so smart, it's just that I stay with problems longer.",
    translation: "내가 똑똑한 게 아니라, 문제를 더 오래 붙들고 있을 뿐이다.",
    author: "Albert Einstein",
    source: "Forbes Magazine (1989)",
  },

  // ─── Winston Churchill ───
  {
    text: "Never give in—never, never, never, never, in nothing, great or small, large or petty.",
    translation: "절대 굴복하지 마라 — 절대, 절대, 절대로. 크든 작든, 위대하든 사소하든.",
    author: "Winston Churchill",
    source: "Harrow School 연설 (1941)",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    translation: "성공은 끝이 아니고 실패는 치명적이지 않다. 중요한 건 계속할 용기다.",
    author: "Winston Churchill",
    source: "전쟁 회고록 / 연설집",
  },

  // ─── Nelson Mandela ───
  {
    text: "It always seems impossible until it's done.",
    translation: "어떤 일이든 해내기 전까지는 늘 불가능해 보인다.",
    author: "Nelson Mandela",
    source: "다양한 연설 (1990년대)",
  },
  {
    text: "I learned that courage was not the absence of fear, but the triumph over it.",
    translation: "용기는 두려움이 없는 것이 아니라, 두려움을 이겨내는 것임을 배웠다.",
    author: "Nelson Mandela",
    source: "Long Walk to Freedom (자서전, 1994)",
  },
  {
    text: "Do not judge me by my successes, judge me by how many times I fell down and got back up again.",
    translation: "내 성공으로 나를 평가하지 말고, 내가 몇 번이나 넘어졌다가 다시 일어났는지로 평가하라.",
    author: "Nelson Mandela",
    source: "Long Walk to Freedom (자서전, 1994)",
  },

  // ─── Theodore Roosevelt ───
  {
    text: "Far and away the best prize that life has to offer is the chance to work hard at work worth doing.",
    translation: "인생이 줄 수 있는 가장 좋은 상은, 할 가치 있는 일에 열심히 일할 기회다.",
    author: "Theodore Roosevelt",
    source: "Labor Day 연설 (1903)",
  },
  {
    text: "Do what you can, with what you have, where you are.",
    translation: "지금 있는 곳에서, 가진 것으로, 할 수 있는 일을 하라.",
    author: "Theodore Roosevelt",
    source: "자서전 (1913)",
  },
  {
    text: "It is not the critic who counts. The credit belongs to the man who is actually in the arena.",
    translation: "중요한 건 비평가가 아니다. 영광은 실제로 경기장에 서 있는 사람의 것이다.",
    author: "Theodore Roosevelt",
    source: "Citizenship in a Republic 연설, 소르본 대학 (1910)",
  },

  // ─── Thomas Edison ───
  {
    text: "Genius is one percent inspiration and ninety-nine percent perspiration.",
    translation: "천재는 1%의 영감과 99%의 땀이다.",
    author: "Thomas Edison",
    source: "Harper's Monthly (1932)",
  },
  {
    text: "I have not failed. I've just found 10,000 ways that won't work.",
    translation: "나는 실패한 적이 없다. 다만 안 되는 방법을 1만 가지 발견했을 뿐이다.",
    author: "Thomas Edison",
    source: "Frank Lewis Dyer 전기 (1910)",
  },
  {
    text: "Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.",
    translation: "우리의 가장 큰 약점은 포기다. 성공의 가장 확실한 방법은 늘 한 번만 더 시도하는 것이다.",
    author: "Thomas Edison",
    source: "Edison Pioneers 회고록",
  },

  // ─── Michael Jordan ───
  {
    text: "I've failed over and over and over again in my life. And that is why I succeed.",
    translation: "나는 인생에서 실패하고, 실패하고, 또 실패했다. 그것이 내가 성공한 이유다.",
    author: "Michael Jordan",
    source: "Nike 'Failure' TV 광고 (1997)",
  },
  {
    text: "I can accept failure, everyone fails at something. But I can't accept not trying.",
    translation: "실패는 받아들일 수 있다. 모두 실패한다. 하지만 시도하지 않는 건 받아들일 수 없다.",
    author: "Michael Jordan",
    source: "I Can't Accept Not Trying (자서전, 1994)",
  },
  {
    text: "Some people want it to happen, some wish it would happen, others make it happen.",
    translation: "어떤 이는 그저 그런 일이 일어나길 바라고, 어떤 이는 일어나게 만든다.",
    author: "Michael Jordan",
    source: "Driven from Within (자서전, 2005)",
  },

  // ─── Maya Angelou ───
  {
    text: "You may encounter many defeats, but you must not be defeated.",
    translation: "수많은 패배를 만날 수는 있지만, 패배자가 되어서는 안 된다.",
    author: "Maya Angelou",
    source: "Letter to My Daughter (2008)",
  },
  {
    text: "Do the best you can until you know better. Then when you know better, do better.",
    translation: "더 좋은 방법을 알기 전까지 최선을 다하라. 더 좋은 방법을 알게 되면 더 잘하라.",
    author: "Maya Angelou",
    source: "Oprah Winfrey Show 인터뷰",
  },

  // ─── Bill Gates ───
  {
    text: "It's fine to celebrate success but it is more important to heed the lessons of failure.",
    translation: "성공을 축하하는 것도 좋지만, 실패에서 배운 교훈에 귀 기울이는 게 더 중요하다.",
    author: "Bill Gates",
    source: "Business @ the Speed of Thought (1999)",
  },
  {
    text: "Success is a lousy teacher. It seduces smart people into thinking they can't lose.",
    translation: "성공은 형편없는 선생이다. 똑똑한 사람들에게 자기는 질 수 없다고 착각하게 만든다.",
    author: "Bill Gates",
    source: "The Road Ahead (1995)",
  },
  {
    text: "Most people overestimate what they can do in one year and underestimate what they can do in ten years.",
    translation: "대부분은 1년 안에 할 수 있는 일은 과대평가하고, 10년 안에 할 수 있는 일은 과소평가한다.",
    author: "Bill Gates",
    source: "Bill Gates 인터뷰",
  },

  // ─── Elon Musk ───
  {
    text: "When something is important enough, you do it even if the odds are not in your favor.",
    translation: "정말 중요한 일이라면, 승산이 없어도 한다.",
    author: "Elon Musk",
    source: "60 Minutes 인터뷰 (2012)",
  },
  {
    text: "Failure is an option here. If things are not failing, you are not innovating enough.",
    translation: "여기선 실패도 선택지다. 실패하지 않는다는 건 충분히 혁신하지 않는다는 뜻이다.",
    author: "Elon Musk",
    source: "Innovation 인터뷰",
  },
  {
    text: "Persistence is very important. You should not give up unless you are forced to give up.",
    translation: "끈기가 정말 중요하다. 포기를 강요받지 않는 한 포기하지 마라.",
    author: "Elon Musk",
    source: "USC Marshall 졸업 연설 (2014)",
  },

  // ─── Warren Buffett ───
  {
    text: "The most important investment you can make is in yourself.",
    translation: "할 수 있는 가장 중요한 투자는 자기 자신에 대한 투자다.",
    author: "Warren Buffett",
    source: "Forbes 인터뷰",
  },
  {
    text: "Risk comes from not knowing what you're doing.",
    translation: "위험은 자기가 무엇을 하는지 모르는 데서 온다.",
    author: "Warren Buffett",
    source: "Berkshire Hathaway 주주 서한 (1993)",
  },
  {
    text: "Someone is sitting in the shade today because someone planted a tree a long time ago.",
    translation: "오늘 누군가 그늘에 앉아 있는 건, 오래전 누군가 나무를 심었기 때문이다.",
    author: "Warren Buffett",
    source: "Berkshire Hathaway 주주 서한",
  },

  // ─── Henry Ford ───
  {
    text: "Whether you think you can, or you think you can't – you're right.",
    translation: "할 수 있다고 생각하든 못한다고 생각하든, 그 생각은 맞다.",
    author: "Henry Ford",
    source: "Reader's Digest 인터뷰 (1947)",
  },
  {
    text: "Coming together is a beginning; keeping together is progress; working together is success.",
    translation: "모이는 것이 시작이요, 함께 하는 것이 진보이며, 함께 일하는 것이 성공이다.",
    author: "Henry Ford",
    source: "My Life and Work (자서전, 1922)",
  },

  // ─── Mahatma Gandhi ───
  {
    text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    translation: "내일 죽을 것처럼 살아라. 영원히 살 것처럼 배워라.",
    author: "Mahatma Gandhi",
    source: "Young India (1925)",
  },
  {
    text: "The future depends on what you do today.",
    translation: "미래는 오늘 네가 무엇을 하는가에 달려 있다.",
    author: "Mahatma Gandhi",
    source: "Harijan 주간지",
  },

  // ─── Vince Lombardi ───
  {
    text: "The only place success comes before work is in the dictionary.",
    translation: "성공이 노력보다 먼저 오는 곳은 사전뿐이다.",
    author: "Vince Lombardi",
    source: "Packers 코치 시절",
  },
  {
    text: "Winners never quit and quitters never win.",
    translation: "승자는 결코 포기하지 않고, 포기하는 자는 결코 이기지 못한다.",
    author: "Vince Lombardi",
    source: "Packers 락커룸 연설",
  },
  {
    text: "The greatest accomplishment is not in never falling, but in rising again after you fall.",
    translation: "가장 위대한 성취는 넘어지지 않는 것이 아니라, 넘어진 뒤 다시 일어서는 것이다.",
    author: "Vince Lombardi",
    source: "Packers 명언집",
  },

  // ─── Helen Keller ───
  {
    text: "The only thing worse than being blind is having sight but no vision.",
    translation: "눈이 보이지 않는 것보다 더 나쁜 건, 시력이 있되 비전이 없는 것이다.",
    author: "Helen Keller",
    source: "Helen Keller 강연집",
  },
  {
    text: "Life is either a daring adventure or nothing at all.",
    translation: "인생은 과감한 모험이거나, 아무것도 아니거나 둘 중 하나다.",
    author: "Helen Keller",
    source: "Let Us Have Faith (1940)",
  },
  {
    text: "Alone we can do so little; together we can do so much.",
    translation: "혼자서는 할 수 있는 일이 적지만, 함께라면 많은 일을 할 수 있다.",
    author: "Helen Keller",
    source: "The Story of My Life (1903)",
  },

  // ─── Martin Luther King Jr. ───
  {
    text: "If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do you have to keep moving forward.",
    translation: "날 수 없으면 뛰고, 뛸 수 없으면 걸어라. 걸을 수 없으면 기어라. 무엇을 하든 앞으로 나아가야 한다.",
    author: "Martin Luther King Jr.",
    source: "Spelman College 연설 (1960)",
  },
  {
    text: "Faith is taking the first step even when you don't see the whole staircase.",
    translation: "믿음이란 계단 전체가 보이지 않아도 첫 걸음을 내딛는 것이다.",
    author: "Martin Luther King Jr.",
    source: "MLK 연설집",
  },
  {
    text: "The time is always right to do what is right.",
    translation: "옳은 일을 하기에 적절한 때는 언제나 지금이다.",
    author: "Martin Luther King Jr.",
    source: "Oberlin College 연설 (1965)",
  },

  // ─── Eleanor Roosevelt ───
  {
    text: "Do one thing every day that scares you.",
    translation: "매일 두려운 일을 한 가지씩 하라.",
    author: "Eleanor Roosevelt",
    source: "You Learn by Living (1960)",
  },
  {
    text: "No one can make you feel inferior without your consent.",
    translation: "누구도 당신의 동의 없이 당신을 열등하게 느끼게 할 수 없다.",
    author: "Eleanor Roosevelt",
    source: "This Is My Story (자서전, 1937)",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    translation: "미래는 자기 꿈의 아름다움을 믿는 사람의 것이다.",
    author: "Eleanor Roosevelt",
    source: "Reader's Digest 인터뷰 (1948)",
  },

  // ─── Confucius ───
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    translation: "멈추지 않는 한, 얼마나 천천히 가는지는 중요하지 않다.",
    author: "Confucius (공자)",
    source: "논어 (論語)",
  },
  {
    text: "Our greatest glory is not in never falling, but in rising every time we fall.",
    translation: "우리의 가장 큰 영광은 절대 넘어지지 않는 것이 아니라, 넘어질 때마다 다시 일어서는 것이다.",
    author: "Confucius (공자)",
    source: "논어 (論語)",
  },

  // ─── Marcus Aurelius ───
  {
    text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
    translation: "너는 외부 사건이 아니라 네 마음에 대해 힘이 있다. 이것을 깨달으면 너는 강해진다.",
    author: "Marcus Aurelius",
    source: "명상록 Meditations (서기 170년경)",
  },
  {
    text: "Waste no more time arguing what a good man should be. Be one.",
    translation: "좋은 사람이 어떤 사람인지 따지느라 시간을 낭비하지 마라. 그냥 좋은 사람이 되어라.",
    author: "Marcus Aurelius",
    source: "명상록 Meditations",
  },
  {
    text: "The impediment to action advances action. What stands in the way becomes the way.",
    translation: "행동을 가로막는 장애가 곧 행동을 진전시킨다. 길을 막는 것이 곧 길이 된다.",
    author: "Marcus Aurelius",
    source: "명상록 Meditations",
  },

  // ─── Seneca ───
  {
    text: "It is not that we have a short time to live, but that we waste a lot of it.",
    translation: "우리 인생이 짧은 것이 아니라, 우리가 많이 낭비하는 것이다.",
    author: "Seneca",
    source: "On the Shortness of Life (서기 49년경)",
  },
  {
    text: "Difficulties strengthen the mind, as labor does the body.",
    translation: "노동이 몸을 단련하듯, 어려움은 마음을 단련시킨다.",
    author: "Seneca",
    source: "Letters from a Stoic (도덕적 서한)",
  },

  // ─── Friedrich Nietzsche ───
  {
    text: "He who has a why to live can bear almost any how.",
    translation: "살 이유가 있는 사람은 어떻게든 살아낼 수 있다.",
    author: "Friedrich Nietzsche",
    source: "Twilight of the Idols (1889)",
  },
  {
    text: "That which does not kill us makes us stronger.",
    translation: "나를 죽이지 못한 것은 나를 더 강하게 만든다.",
    author: "Friedrich Nietzsche",
    source: "Twilight of the Idols (1889)",
  },

  // ─── Viktor Frankl ───
  {
    text: "When we are no longer able to change a situation, we are challenged to change ourselves.",
    translation: "상황을 바꿀 수 없을 때, 우리는 자신을 바꿔야 한다는 도전을 받는다.",
    author: "Viktor Frankl",
    source: "Man's Search for Meaning (1946)",
  },
  {
    text: "Between stimulus and response there is a space. In that space is our power to choose our response.",
    translation: "자극과 반응 사이에는 공간이 있다. 그 공간 안에 우리의 반응을 선택할 힘이 있다.",
    author: "Viktor Frankl",
    source: "Man's Search for Meaning (1946)",
  },

  // ─── Walt Disney ───
  {
    text: "The way to get started is to quit talking and begin doing.",
    translation: "시작하는 방법은 말을 멈추고 행동을 시작하는 것이다.",
    author: "Walt Disney",
    source: "Walt Disney Company 사훈집",
  },
  {
    text: "If you can dream it, you can do it.",
    translation: "꿈꿀 수 있다면 이룰 수 있다.",
    author: "Walt Disney",
    source: "Disney 강연 (1955)",
  },
  {
    text: "All our dreams can come true if we have the courage to pursue them.",
    translation: "우리의 모든 꿈은, 그것을 좇을 용기만 있다면 이루어진다.",
    author: "Walt Disney",
    source: "Disney 인터뷰 (1956)",
  },

  // ─── Bruce Lee ───
  {
    text: "Don't fear failure. Not failure, but low aim, is the crime.",
    translation: "실패를 두려워하지 마라. 실패가 아니라 낮은 목표가 죄다.",
    author: "Bruce Lee",
    source: "Striking Thoughts (2002)",
  },
  {
    text: "If you spend too much time thinking about a thing, you'll never get it done.",
    translation: "어떤 일을 너무 오래 생각만 하면 결코 그 일을 해내지 못한다.",
    author: "Bruce Lee",
    source: "Tao of Jeet Kune Do (1975)",
  },
  {
    text: "Knowing is not enough, we must apply. Willing is not enough, we must do.",
    translation: "아는 것만으로는 부족하다. 적용해야 한다. 의지만으로는 부족하다. 행해야 한다.",
    author: "Bruce Lee",
    source: "Bruce Lee 인터뷰 (1971)",
  },

  // ─── Wayne Gretzky ───
  {
    text: "You miss 100% of the shots you don't take.",
    translation: "쏘지 않은 슛은 100% 빗나간다.",
    author: "Wayne Gretzky",
    source: "NHL 인터뷰 (1983)",
  },

  // ─── John F. Kennedy ───
  {
    text: "We choose to go to the Moon in this decade and do the other things, not because they are easy, but because they are hard.",
    translation: "우리는 이번 10년 안에 달에 가기로 한다. 쉬워서가 아니라 어렵기 때문이다.",
    author: "John F. Kennedy",
    source: "Rice University 연설 (1962)",
  },

  // ─── Will Smith ───
  {
    text: "I'm not afraid to die on a treadmill.",
    translation: "나는 러닝머신 위에서 죽는 것을 두려워하지 않는다.",
    author: "Will Smith",
    source: "Tavis Smiley Show 인터뷰 (2007)",
  },

  // ─── Arnold Schwarzenegger ───
  {
    text: "The last three or four reps is what makes the muscle grow. This area of pain divides the champion from someone who is not a champion.",
    translation: "마지막 3, 4회의 반복이 근육을 만든다. 그 고통의 영역이 챔피언과 아닌 사람을 가른다.",
    author: "Arnold Schwarzenegger",
    source: "Pumping Iron 다큐멘터리 (1977)",
  },
  {
    text: "Strength does not come from winning. Your struggles develop your strengths.",
    translation: "강함은 이기는 데서 오지 않는다. 너의 고난이 강함을 키운다.",
    author: "Arnold Schwarzenegger",
    source: "Total Recall (자서전, 2012)",
  },

  // ─── David Goggins ───
  {
    text: "The most important conversations you'll ever have are the ones you'll have with yourself.",
    translation: "네가 하게 될 가장 중요한 대화는 너 자신과의 대화다.",
    author: "David Goggins",
    source: "Can't Hurt Me (자서전, 2018)",
  },
  {
    text: "The hardest person to motivate is yourself.",
    translation: "동기부여하기 가장 어려운 사람은 바로 자기 자신이다.",
    author: "David Goggins",
    source: "Can't Hurt Me (자서전, 2018)",
  },

  // ─── Kobe Bryant ───
  {
    text: "Great things come from hard work and perseverance. No excuses.",
    translation: "위대한 것은 노력과 인내에서 온다. 변명은 없다.",
    author: "Kobe Bryant",
    source: "Kobe Bryant 인터뷰",
  },
  {
    text: "If you really want to be great at something you have to truly care about it.",
    translation: "어떤 일에 정말 위대해지고 싶다면, 진심으로 그 일을 신경 써야 한다.",
    author: "Kobe Bryant",
    source: "Mamba Mentality (자서전, 2018)",
  },

  // ─── Jeff Bezos ───
  {
    text: "I knew that if I failed I wouldn't regret that, but I knew the one thing I might regret is not trying.",
    translation: "실패해도 후회하지 않을 거란 걸 알았다. 하지만 시도하지 않은 건 후회할지 모른다는 걸 알았다.",
    author: "Jeff Bezos",
    source: "Princeton 졸업 연설 (2010)",
  },
  {
    text: "What's dangerous is not to evolve.",
    translation: "위험한 것은 진화하지 않는 것이다.",
    author: "Jeff Bezos",
    source: "Business Insider 인터뷰 (2014)",
  },

  // ─── Tim Cook ───
  {
    text: "Let your joy be in your journey – not in some distant goal.",
    translation: "기쁨은 멀리 있는 목표가 아니라 너의 여정에 있게 하라.",
    author: "Tim Cook",
    source: "Duke University 졸업 연설 (2018)",
  },

  // ─── Sheryl Sandberg ───
  {
    text: "Done is better than perfect.",
    translation: "완벽보다 완성이 낫다.",
    author: "Sheryl Sandberg",
    source: "Lean In (2013) — Facebook 사훈",
  },
  {
    text: "If you're offered a seat on a rocket ship, don't ask what seat! Just get on.",
    translation: "로켓에 자리를 제안받으면 어떤 자리인지 묻지 마라. 그냥 타라.",
    author: "Sheryl Sandberg",
    source: "Harvard Business School 졸업 연설 (2012)",
  },

  // ─── Reid Hoffman ───
  {
    text: "If you are not embarrassed by the first version of your product, you've launched too late.",
    translation: "당신의 첫 제품 버전이 부끄럽지 않다면, 너무 늦게 출시한 것이다.",
    author: "Reid Hoffman",
    source: "LinkedIn 공동창업자 인터뷰 (2007)",
  },

  // ─── Peter Drucker ───
  {
    text: "The best way to predict the future is to create it.",
    translation: "미래를 예측하는 가장 좋은 방법은 미래를 만드는 것이다.",
    author: "Peter Drucker",
    source: "Management: Tasks, Responsibilities, Practices (1973)",
  },
  {
    text: "What gets measured gets managed.",
    translation: "측정되는 것이 관리된다.",
    author: "Peter Drucker",
    source: "The Practice of Management (1954)",
  },

  // ─── Andy Grove ───
  {
    text: "Only the paranoid survive.",
    translation: "편집증적인 사람만이 살아남는다.",
    author: "Andy Grove",
    source: "Only the Paranoid Survive (1996)",
  },

  // ─── Linus Torvalds ───
  {
    text: "Talk is cheap. Show me the code.",
    translation: "말은 싸다. 코드를 보여달라.",
    author: "Linus Torvalds",
    source: "Linux Kernel 메일링 리스트 (2000)",
  },

  // ─── Donald Knuth ───
  {
    text: "Premature optimization is the root of all evil.",
    translation: "성급한 최적화는 만악의 근원이다.",
    author: "Donald Knuth",
    source: "Structured Programming with go to Statements (1974)",
  },

  // ─── Edsger Dijkstra ───
  {
    text: "Simplicity is prerequisite for reliability.",
    translation: "단순함은 신뢰성의 전제 조건이다.",
    author: "Edsger W. Dijkstra",
    source: "EWD498 (1975)",
  },

  // ─── Grace Hopper ───
  {
    text: "The most dangerous phrase in the language is, 'We've always done it this way.'",
    translation: "가장 위험한 말은 '우리는 늘 이렇게 해왔다'이다.",
    author: "Grace Hopper",
    source: "InformationWeek 인터뷰 (1976)",
  },

  // ─── Cal Newport ───
  {
    text: "Clarity about what matters provides clarity about what does not.",
    translation: "무엇이 중요한지 분명하면, 무엇이 중요하지 않은지도 분명해진다.",
    author: "Cal Newport",
    source: "Deep Work (2016)",
  },
  {
    text: "Human beings are at their best when immersed deeply in something challenging.",
    translation: "인간은 어려운 일에 깊이 몰입할 때 가장 좋은 모습을 보인다.",
    author: "Cal Newport",
    source: "Deep Work (2016)",
  },

  // ─── James Clear ───
  {
    text: "You do not rise to the level of your goals. You fall to the level of your systems.",
    translation: "목표의 수준에 도달하는 것이 아니라, 시스템의 수준으로 떨어진다.",
    author: "James Clear",
    source: "Atomic Habits (2018)",
  },
  {
    text: "Every action you take is a vote for the type of person you wish to become.",
    translation: "당신이 하는 모든 행동은 당신이 되고 싶은 사람에게 던지는 한 표다.",
    author: "James Clear",
    source: "Atomic Habits (2018)",
  },
  {
    text: "Habits are the compound interest of self-improvement.",
    translation: "습관은 자기계발의 복리(複利)다.",
    author: "James Clear",
    source: "Atomic Habits (2018)",
  },

  // ─── Naval Ravikant ───
  {
    text: "Earn with your mind, not with your time.",
    translation: "시간이 아니라 머리로 벌어라.",
    author: "Naval Ravikant",
    source: "How to Get Rich (without getting lucky) Twitter (2018)",
  },

  // ─── Paul Graham ───
  {
    text: "Make something people want.",
    translation: "사람들이 원하는 것을 만들어라.",
    author: "Paul Graham",
    source: "Y Combinator 사훈",
  },
  {
    text: "Do things that don't scale.",
    translation: "확장되지 않는 일을 하라.",
    author: "Paul Graham",
    source: "Do Things that Don't Scale 에세이 (2013)",
  },

  // ─── Carl Sagan ───
  {
    text: "Somewhere, something incredible is waiting to be known.",
    translation: "어딘가에서, 놀라운 무언가가 발견되기를 기다리고 있다.",
    author: "Carl Sagan",
    source: "Cosmos (TV 시리즈, 1980)",
  },

  // ─── Stephen Hawking ───
  {
    text: "Look up at the stars and not down at your feet. Be curious.",
    translation: "발끝이 아니라 별을 올려다보라. 호기심을 가져라.",
    author: "Stephen Hawking",
    source: "BBC 인터뷰 (2010)",
  },
  {
    text: "Intelligence is the ability to adapt to change.",
    translation: "지능이란 변화에 적응하는 능력이다.",
    author: "Stephen Hawking",
    source: "강연집 (1980년대)",
  },

  // ─── Jim Rohn ───
  {
    text: "Discipline is the bridge between goals and accomplishment.",
    translation: "규율은 목표와 성취 사이의 다리다.",
    author: "Jim Rohn",
    source: "The Seasons of Life (1981)",
  },

  // ─── John Wooden ───
  {
    text: "Do not let what you cannot do interfere with what you can do.",
    translation: "할 수 없는 일이 할 수 있는 일을 방해하게 두지 마라.",
    author: "John Wooden",
    source: "Wooden: A Lifetime of Observations (1997)",
  },

  // ─── Vincent van Gogh ───
  {
    text: "Great things are not done by impulse, but by a series of small things brought together.",
    translation: "위대한 일은 충동으로 이루어지지 않고, 작은 일들이 모여서 이루어진다.",
    author: "Vincent van Gogh",
    source: "동생 Theo에게 보낸 편지 (1882)",
  },
  {
    text: "If you hear a voice within you say 'you cannot paint,' then by all means paint, and that voice will be silenced.",
    translation: "네 안에서 '너는 그림을 그릴 수 없어'라는 목소리가 들리면, 반드시 그려라. 그러면 그 목소리는 사라진다.",
    author: "Vincent van Gogh",
    source: "동생 Theo에게 보낸 편지 (1884)",
  },

  // ─── J.R.R. Tolkien ───
  {
    text: "Even the smallest person can change the course of the future.",
    translation: "아무리 작은 사람도 미래의 흐름을 바꿀 수 있다.",
    author: "J.R.R. Tolkien",
    source: "The Fellowship of the Ring (1954)",
  },

  // ─── Antoine de Saint-Exupéry ───
  {
    text: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.",
    translation: "완벽함은 더할 것이 없을 때가 아니라, 뺄 것이 없을 때 달성된다.",
    author: "Antoine de Saint-Exupéry",
    source: "Wind, Sand and Stars (1939)",
  },

  // ─── Howard Schultz ───
  {
    text: "In times of adversity and change, we really discover who we are and what we're made of.",
    translation: "역경과 변화의 시기에 우리는 진정 자신이 누구이며 무엇으로 만들어졌는지 발견한다.",
    author: "Howard Schultz",
    source: "Onward (2011)",
  },

  // ─── Brené Brown ───
  {
    text: "Vulnerability is not winning or losing; it's having the courage to show up and be seen.",
    translation: "취약함은 이기고 지는 것이 아니라, 나서서 보여질 용기를 갖는 것이다.",
    author: "Brené Brown",
    source: "Rising Strong (2015)",
  },

  // ─── Richard Branson ───
  {
    text: "Screw it, just do it.",
    translation: "에라 모르겠다, 그냥 해라.",
    author: "Richard Branson",
    source: "Screw It, Let's Do It (2006)",
  },

  // ─── Eric Schmidt ───
  {
    text: "If you're offered a seat on a rocket ship, get on.",
    translation: "로켓에 자리를 제안받으면 그냥 타라.",
    author: "Eric Schmidt",
    source: "Google CEO 시절 강연 (2007)",
  },

  // ─── Andrew Carnegie (앤드류 카네기) ───
  {
    text: "Concentrate; put all your eggs in one basket, and watch that basket.",
    translation: "집중하라. 모든 달걀을 한 바구니에 담고, 그 바구니를 지켜봐라.",
    author: "Andrew Carnegie",
    source: "Autobiography of Andrew Carnegie (1920)",
  },
  {
    text: "The man who dies rich dies disgraced.",
    translation: "부를 쌓아두고 죽는 사람은 부끄럽게 죽는 것이다.",
    author: "Andrew Carnegie",
    source: "The Gospel of Wealth (1889)",
  },
  {
    text: "Do your duty and a little more, and the future will take care of itself.",
    translation: "네 의무를 다하고, 거기에 조금만 더 하라. 미래는 알아서 펼쳐진다.",
    author: "Andrew Carnegie",
    source: "Autobiography of Andrew Carnegie (1920)",
  },
  {
    text: "Take away my factories, but leave my men, and I will rebuild my factories. Take away my men, and grass will grow in the factory floors.",
    translation: "공장을 빼앗아도 사람만 남기면 다시 짓는다. 사람을 빼앗으면 공장 바닥에는 풀이 자랄 것이다.",
    author: "Andrew Carnegie",
    source: "Empire of Business (1902)",
  },
  {
    text: "People who are unable to motivate themselves must be content with mediocrity, no matter how impressive their other talents.",
    translation: "스스로를 동기부여하지 못하는 사람은, 다른 재능이 아무리 뛰어나도 평범함에 만족할 수밖에 없다.",
    author: "Andrew Carnegie",
    source: "Autobiography of Andrew Carnegie (1920)",
  },
  {
    text: "Aim for the highest.",
    translation: "가장 높은 곳을 노려라.",
    author: "Andrew Carnegie",
    source: "Curry Commercial College 연설 (1885)",
  },
  {
    text: "There is little success where there is little laughter.",
    translation: "웃음이 없는 곳에는 성공도 거의 없다.",
    author: "Andrew Carnegie",
    source: "Autobiography of Andrew Carnegie (1920)",
  },

  // ─── Eric Thomas (ET the Hip Hop Preacher) — YouTube 동기부여 ───
  {
    text: "When you want to succeed as bad as you want to breathe, then you'll be successful.",
    translation: "숨 쉬는 것만큼 간절히 성공을 원할 때, 그때 너는 성공한다.",
    author: "Eric Thomas",
    source: "Secrets to Success (YouTube, 2008)",
  },
  {
    text: "Pain is temporary. It may last a minute, or an hour, or a day, or a year, but eventually it will subside.",
    translation: "고통은 일시적이다. 1분, 1시간, 하루, 1년 갈 수 있지만 결국엔 사그라든다.",
    author: "Eric Thomas",
    source: "ET 모교 강연 (YouTube, 2011)",
  },
  {
    text: "Don't cry to quit! You already in pain, you already hurt! Get a reward from it!",
    translation: "포기하려고 울지 마라. 이미 고통 속이고 이미 아프다. 그것에서 보상을 받아내라.",
    author: "Eric Thomas",
    source: "TGIM #67 (YouTube, 2012)",
  },

  // ─── Les Brown ───
  {
    text: "Shoot for the moon. Even if you miss, you'll land among the stars.",
    translation: "달을 향해 쏴라. 빗나가도 별들 사이에 떨어진다.",
    author: "Les Brown",
    source: "Les Brown 강연 시리즈 (1990년대)",
  },
  {
    text: "You don't have to be great to get started, but you have to get started to be great.",
    translation: "시작하는 데 위대할 필요는 없다. 그러나 위대해지려면 시작해야 한다.",
    author: "Les Brown",
    source: "Live Your Dreams (1994)",
  },
  {
    text: "The graveyard is the richest place on earth. So many dreams that never came to fruition.",
    translation: "묘지는 지구상에서 가장 부유한 곳이다. 이루지 못한 수많은 꿈들이 거기 묻혀 있다.",
    author: "Les Brown",
    source: "It's Possible 강연 (YouTube, 2009)",
  },

  // ─── Mel Robbins ───
  {
    text: "If you have an impulse to act on a goal, you must physically move within 5 seconds or your brain will kill it.",
    translation: "목표를 향해 행동하고 싶은 충동이 들면, 5초 안에 몸을 움직여라. 안 그러면 뇌가 죽인다.",
    author: "Mel Robbins",
    source: "The 5 Second Rule (2017) / TEDx San Francisco (2011)",
  },
  {
    text: "You are one decision away from a completely different life.",
    translation: "완전히 다른 인생은 결정 하나 거리에 있다.",
    author: "Mel Robbins",
    source: "The High 5 Habit (2021)",
  },

  // ─── Simon Sinek ───
  {
    text: "People don't buy what you do; they buy why you do it.",
    translation: "사람들은 당신이 무엇을 하는지를 사지 않는다. 왜 하는지를 산다.",
    author: "Simon Sinek",
    source: "Start With Why (TED Talk, 2009)",
  },
  {
    text: "Working hard for something we don't care about is called stress; working hard for something we love is called passion.",
    translation: "관심 없는 일에 열심히 일하는 것은 스트레스다. 사랑하는 일에 열심히 일하는 것은 열정이다.",
    author: "Simon Sinek",
    source: "Start With Why (TED Talk, 2009)",
  },
  {
    text: "A leader's job is not to do the work for others, it's to help others figure out how to do it themselves.",
    translation: "리더의 일은 남의 일을 대신 해주는 것이 아니라, 남이 스스로 해내는 법을 찾도록 돕는 것이다.",
    author: "Simon Sinek",
    source: "Leaders Eat Last (2014)",
  },

  // ─── Gary Vaynerchuk (GaryVee) ───
  {
    text: "Skills are cheap. Passion is priceless.",
    translation: "기술은 싸다. 열정은 값을 매길 수 없다.",
    author: "Gary Vaynerchuk",
    source: "Crush It! (2009)",
  },
  {
    text: "Stop watching, start doing.",
    translation: "보는 것을 멈추고 하는 것을 시작하라.",
    author: "Gary Vaynerchuk",
    source: "DailyVee (YouTube 시리즈, 2015~)",
  },
  {
    text: "Legacy is greater than currency.",
    translation: "유산은 통화보다 위대하다.",
    author: "Gary Vaynerchuk",
    source: "Crushing It! (2018)",
  },

  // ─── Tom Bilyeu ───
  {
    text: "What you allow is what will continue.",
    translation: "당신이 허용하는 것이 계속될 것이다.",
    author: "Tom Bilyeu",
    source: "Impact Theory (YouTube 팟캐스트, 2016~)",
  },

  // ─── Jay Shetty ───
  {
    text: "Don't judge others, build yourself first.",
    translation: "남을 판단하지 말고, 먼저 너 자신을 만들어라.",
    author: "Jay Shetty",
    source: "Think Like a Monk (2020)",
  },

  // ─── Ryan Holiday ───
  {
    text: "The obstacle is the way.",
    translation: "장애물이 곧 길이다.",
    author: "Ryan Holiday",
    source: "The Obstacle Is the Way (2014)",
  },
  {
    text: "Ego is the enemy.",
    translation: "자아(에고)가 적이다.",
    author: "Ryan Holiday",
    source: "Ego Is the Enemy (2016)",
  },

  // ─── Inky Johnson ───
  {
    text: "If you don't quit, you can't lose.",
    translation: "포기하지 않으면 질 수 없다.",
    author: "Inky Johnson",
    source: "Inky Johnson 모티베이션 투어 (YouTube, 2014~)",
  },

  // ─── 한국 인물 ───
  {
    text: "99도까지 열심히 노력해도 마지막 1도를 넘기지 못하면 영원히 물은 끓지 않는다. 물을 끓이는 건 마지막 1도, 포기하고 싶은 바로 그 1분을 참아내는 것이다.",
    author: "김연아",
    source: "김연아의 7분 드라마 (자서전, 2010)",
  },
  {
    text: "할 수 있다고 믿는 사람이 결국 그 일을 해낸다.",
    author: "김연아",
    source: "은퇴 인터뷰 (2014)",
  },
  {
    text: "내 발끝에서 내 인생이 만들어진다.",
    author: "박지성",
    source: "멈추지 않는 도전 (자서전, 2010)",
  },
  {
    text: "재능은 한계가 있지만 노력은 한계가 없다.",
    author: "박지성",
    source: "은퇴 기자회견 (2014)",
  },
  {
    text: "프로는 컨디션을 핑계 대지 않는다.",
    author: "손흥민",
    source: "EPL 인터뷰 (2019)",
  },
  {
    text: "노력의 결과는 거짓말을 하지 않는다.",
    author: "손흥민",
    source: "다큐멘터리 'SON' (2019)",
  },
  {
    text: "분노가 나의 원동력이었다.",
    author: "방시혁",
    source: "서울대 졸업 축사 (2019)",
  },
  {
    text: "꿈은 좇는 것이 아니라 만나는 것이다.",
    author: "방시혁",
    source: "서울대 졸업 축사 (2019)",
  },
  {
    text: "이봐, 해봤어?",
    author: "정주영",
    source: "시련은 있어도 실패는 없다 (자서전, 1991)",
  },
  {
    text: "길이 없으면 길을 만들며 간다.",
    author: "정주영",
    source: "시련은 있어도 실패는 없다 (자서전, 1991)",
  },
  {
    text: "실패는 없다. 시련만 있을 뿐.",
    author: "정주영",
    source: "시련은 있어도 실패는 없다 (자서전, 1991)",
  },
  {
    text: "마누라와 자식 빼고 다 바꿔라.",
    author: "이건희",
    source: "삼성 신경영 프랑크푸르트 선언 (1993)",
  },
  {
    text: "2등은 아무도 기억해주지 않는다.",
    author: "이건희",
    source: "삼성 신경영 강연 (1993)",
  },
  {
    text: "필사즉생, 필생즉사 — 죽고자 하면 살 것이요, 살고자 하면 죽을 것이다.",
    author: "이순신",
    source: "난중일기 / 명량해전 직전 훈시 (1597)",
  },
  {
    text: "신에게는 아직 열두 척의 배가 있사옵니다.",
    author: "이순신",
    source: "선조에게 올린 장계 (1597)",
  },
  {
    text: "하루라도 책을 읽지 않으면 입에 가시가 돋친다.",
    author: "안중근",
    source: "여순 감옥 유묵 (1910)",
  },
  {
    text: "나는 우리나라가 세계에서 가장 아름다운 나라가 되기를 원한다.",
    author: "김구",
    source: "백범일지 (1947)",
  },
  {
    text: "독서는 사람을 풍성하게 하고, 회의는 사람을 깊이 있게 하며, 글쓰기는 사람을 정확하게 한다.",
    author: "정약용",
    source: "유배지에서 보낸 편지 (1801~1818)",
  },
  {
    text: "낙망(落望)은 청년의 죽음이요, 청년이 죽으면 민족이 죽는다.",
    author: "안창호 (도산)",
    source: "흥사단 강연집 (1920년대)",
  },
  {
    text: "다른 사람의 인생을 살지 말고 너의 인생을 살아라.",
    author: "박경철",
    source: "시골의사의 아름다운 동행 (2005)",
  },
  {
    text: "인재가 가장 큰 재산이다.",
    author: "이병철",
    source: "호암자전 (자서전, 1986)",
  },
  {
    text: "쓰지 않으면 사라진다.",
    author: "김연수",
    source: "지지 않는다는 말 (2012)",
  },
  {
    text: "고통은 피할 수 없다. 그러나 괴로움은 선택이다.",
    author: "무라카미 하루키",
    source: "달리기를 말할 때 내가 하고 싶은 이야기 (2007)",
  },
  {
    text: "매일같이 달린다. 그것이 나에게는 일종의 의식 같은 것이다.",
    author: "무라카미 하루키",
    source: "달리기를 말할 때 내가 하고 싶은 이야기 (2007)",
  },
];

export function randomQuote(): Quote {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
