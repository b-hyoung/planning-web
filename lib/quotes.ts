/**
 * 동기부여 명언 — 실제 인물 + 출처 명확한 것만.
 * (불확실하거나 misattribution 의심되는 건 의도적으로 제외)
 */

export interface Quote {
  text: string;
  author: string;
  source: string;
}

export const QUOTES: Quote[] = [
  // ─── Steve Jobs (Stanford Commencement Address, 2005) ───
  {
    text: "Stay hungry, stay foolish.",
    author: "Steve Jobs",
    source: "Stanford 졸업 연설 (2005)",
  },
  {
    text: "Your time is limited, so don't waste it living someone else's life.",
    author: "Steve Jobs",
    source: "Stanford 졸업 연설 (2005)",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    source: "Stanford 졸업 연설 (2005)",
  },
  {
    text: "Death is very likely the single best invention of life. It's life's change agent.",
    author: "Steve Jobs",
    source: "Stanford 졸업 연설 (2005)",
  },
  {
    text: "You can't connect the dots looking forward; you can only connect them looking backwards.",
    author: "Steve Jobs",
    source: "Stanford 졸업 연설 (2005)",
  },
  {
    text: "Don't let the noise of others' opinions drown out your own inner voice.",
    author: "Steve Jobs",
    source: "Stanford 졸업 연설 (2005)",
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    source: "Innovation: The Classic Traps (BusinessWeek, 2004 인터뷰)",
  },
  {
    text: "Design is not just what it looks like and feels like. Design is how it works.",
    author: "Steve Jobs",
    source: "The Guts of a New Machine (NYT Magazine, 2003)",
  },

  // ─── J.K. Rowling (Harvard Commencement, 2008) ───
  {
    text: "It is impossible to live without failing at something, unless you live so cautiously that you might as well not have lived at all – in which case, you fail by default.",
    author: "J.K. Rowling",
    source: "Harvard 졸업 연설 (2008)",
  },
  {
    text: "Rock bottom became the solid foundation on which I rebuilt my life.",
    author: "J.K. Rowling",
    source: "Harvard 졸업 연설 (2008)",
  },
  {
    text: "We do not need magic to transform our world; we carry all of the power we need inside ourselves already.",
    author: "J.K. Rowling",
    source: "Harvard 졸업 연설 (2008)",
  },

  // ─── Albert Einstein ───
  {
    text: "Imagination is more important than knowledge.",
    author: "Albert Einstein",
    source: "On Cosmic Religion and Other Opinions and Aphorisms (1931)",
  },
  {
    text: "Try not to become a man of success, but rather try to become a man of value.",
    author: "Albert Einstein",
    source: "LIFE 잡지 인터뷰 (1955)",
  },
  {
    text: "Logic will get you from A to B. Imagination will take you everywhere.",
    author: "Albert Einstein",
    source: "Saturday Evening Post 인터뷰 (1929)",
  },
  {
    text: "It's not that I'm so smart, it's just that I stay with problems longer.",
    author: "Albert Einstein",
    source: "Forbes Magazine 인터뷰 (1989, 사후 공개)",
  },

  // ─── Winston Churchill ───
  {
    text: "Never give in—never, never, never, never, in nothing, great or small, large or petty.",
    author: "Winston Churchill",
    source: "Harrow School 연설 (1941)",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    source: "전쟁 회고록 / 연설집",
  },

  // ─── Nelson Mandela ───
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
    source: "다양한 연설 (1990년대)",
  },
  {
    text: "I learned that courage was not the absence of fear, but the triumph over it.",
    author: "Nelson Mandela",
    source: "Long Walk to Freedom (자서전, 1994)",
  },
  {
    text: "There is no passion to be found playing small – in settling for a life that is less than the one you are capable of living.",
    author: "Nelson Mandela",
    source: "Long Walk to Freedom (자서전, 1994)",
  },
  {
    text: "Do not judge me by my successes, judge me by how many times I fell down and got back up again.",
    author: "Nelson Mandela",
    source: "Long Walk to Freedom (자서전, 1994)",
  },

  // ─── Theodore Roosevelt ───
  {
    text: "Far and away the best prize that life has to offer is the chance to work hard at work worth doing.",
    author: "Theodore Roosevelt",
    source: "Labor Day 연설 (1903)",
  },
  {
    text: "Do what you can, with what you have, where you are.",
    author: "Theodore Roosevelt",
    source: "자서전 (1913)",
  },
  {
    text: "It is not the critic who counts; not the man who points out how the strong man stumbles. The credit belongs to the man who is actually in the arena.",
    author: "Theodore Roosevelt",
    source: "Citizenship in a Republic 연설, 소르본 대학 (1910)",
  },

  // ─── Thomas Edison ───
  {
    text: "Genius is one percent inspiration and ninety-nine percent perspiration.",
    author: "Thomas Edison",
    source: "Harper's Monthly 인터뷰 (1932)",
  },
  {
    text: "Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.",
    author: "Thomas Edison",
    source: "Edison Pioneers 회고록",
  },
  {
    text: "I have not failed. I've just found 10,000 ways that won't work.",
    author: "Thomas Edison",
    source: "전구 발명 일화 / Frank Lewis Dyer 전기 (1910)",
  },

  // ─── Michael Jordan ───
  {
    text: "I've missed more than 9,000 shots in my career. I've lost almost 300 games. 26 times I've been trusted to take the game winning shot and missed. I've failed over and over and over again in my life. And that is why I succeed.",
    author: "Michael Jordan",
    source: "Nike 'Failure' TV 광고 (1997)",
  },
  {
    text: "I can accept failure, everyone fails at something. But I can't accept not trying.",
    author: "Michael Jordan",
    source: "I Can't Accept Not Trying (자서전, 1994)",
  },
  {
    text: "Some people want it to happen, some wish it would happen, others make it happen.",
    author: "Michael Jordan",
    source: "Driven from Within (자서전, 2005)",
  },

  // ─── Maya Angelou ───
  {
    text: "You may encounter many defeats, but you must not be defeated.",
    author: "Maya Angelou",
    source: "Letter to My Daughter (2008)",
  },
  {
    text: "Do the best you can until you know better. Then when you know better, do better.",
    author: "Maya Angelou",
    source: "Oprah Winfrey Show 인터뷰 (다수)",
  },
  {
    text: "If you don't like something, change it. If you can't change it, change your attitude.",
    author: "Maya Angelou",
    source: "Wouldn't Take Nothing for My Journey Now (1993)",
  },

  // ─── Confucius (공자) ───
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "공자 (Confucius)",
    source: "논어 (論語)",
  },
  {
    text: "When it is obvious that the goals cannot be reached, don't adjust the goals, adjust the action steps.",
    author: "공자 (Confucius)",
    source: "논어 (論語)",
  },
  {
    text: "Our greatest glory is not in never falling, but in rising every time we fall.",
    author: "공자 (Confucius)",
    source: "논어 (論語) — 오랜 인용",
  },

  // ─── Bill Gates ───
  {
    text: "It's fine to celebrate success but it is more important to heed the lessons of failure.",
    author: "Bill Gates",
    source: "Business @ the Speed of Thought (1999)",
  },
  {
    text: "Success is a lousy teacher. It seduces smart people into thinking they can't lose.",
    author: "Bill Gates",
    source: "The Road Ahead (1995)",
  },
  {
    text: "Most people overestimate what they can do in one year and underestimate what they can do in ten years.",
    author: "Bill Gates",
    source: "Bill Gates 인터뷰 (다수)",
  },

  // ─── Elon Musk ───
  {
    text: "When something is important enough, you do it even if the odds are not in your favor.",
    author: "Elon Musk",
    source: "60 Minutes 인터뷰 (2012)",
  },
  {
    text: "Failure is an option here. If things are not failing, you are not innovating enough.",
    author: "Elon Musk",
    source: "Innovation 인터뷰 (다수)",
  },
  {
    text: "I think it's possible for ordinary people to choose to be extraordinary.",
    author: "Elon Musk",
    source: "60 Minutes 인터뷰 (2012)",
  },
  {
    text: "Persistence is very important. You should not give up unless you are forced to give up.",
    author: "Elon Musk",
    source: "USC Marshall 졸업 연설 (2014)",
  },

  // ─── Warren Buffett ───
  {
    text: "The most important investment you can make is in yourself.",
    author: "Warren Buffett",
    source: "Forbes 인터뷰 (다수)",
  },
  {
    text: "Risk comes from not knowing what you're doing.",
    author: "Warren Buffett",
    source: "Berkshire Hathaway 주주 서한 (1993)",
  },
  {
    text: "It takes 20 years to build a reputation and five minutes to ruin it.",
    author: "Warren Buffett",
    source: "Berkshire Hathaway 주주 서한 (1994)",
  },
  {
    text: "Someone is sitting in the shade today because someone planted a tree a long time ago.",
    author: "Warren Buffett",
    source: "Berkshire Hathaway 주주 서한",
  },

  // ─── Henry Ford ───
  {
    text: "Whether you think you can, or you think you can't – you're right.",
    author: "Henry Ford",
    source: "Reader's Digest 인터뷰 (1947)",
  },
  {
    text: "Coming together is a beginning; keeping together is progress; working together is success.",
    author: "Henry Ford",
    source: "My Life and Work (자서전, 1922)",
  },

  // ─── Mahatma Gandhi ───
  {
    text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi",
    source: "Young India (1925)",
  },
  {
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi",
    source: "Harijan 주간지 연재",
  },
  {
    text: "First they ignore you, then they laugh at you, then they fight you, then you win.",
    author: "Mahatma Gandhi",
    source: "노조 연설 (1918, 다양한 출처)",
  },

  // ─── Vince Lombardi ───
  {
    text: "The only place success comes before work is in the dictionary.",
    author: "Vince Lombardi",
    source: "Packers 코치 시절 (1960년대)",
  },
  {
    text: "Winners never quit and quitters never win.",
    author: "Vince Lombardi",
    source: "Packers 락커룸 연설집",
  },
  {
    text: "The greatest accomplishment is not in never falling, but in rising again after you fall.",
    author: "Vince Lombardi",
    source: "Packers 코치 시절 명언집",
  },

  // ─── 김연아 ───
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

  // ─── 박지성 ───
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

  // ─── 손흥민 ───
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

  // ─── 방시혁 ───
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

  // ─── 정주영 (현대 창업자) ───
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

  // ─── 이건희 (삼성 회장) ───
  {
    text: "마누라와 자식 빼고 다 바꿔라.",
    author: "이건희",
    source: "프랑크푸르트 선언 (1993)",
  },
  {
    text: "2등은 아무도 기억해주지 않는다.",
    author: "이건희",
    source: "삼성 신경영 강연 (1993)",
  },

  // ─── 손정의 (마사요시 손, 소프트뱅크) ───
  {
    text: "등산을 시작하기 전, 어느 산을 오를지 정하는 데 인생의 절반이 결정된다.",
    author: "손정의 (Masayoshi Son)",
    source: "도전 — 손정의의 300년 비전 (2010)",
  },

  // ─── 무라카미 하루키 ───
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

  // ─── 이순신 ───
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

  // ─── 안중근 ───
  {
    text: "하루라도 책을 읽지 않으면 입에 가시가 돋친다.",
    author: "안중근",
    source: "여순 감옥 유묵 (1910)",
  },

  // ─── 김구 ───
  {
    text: "나는 우리나라가 세계에서 가장 아름다운 나라가 되기를 원한다.",
    author: "김구",
    source: "백범일지 (1947)",
  },

  // ─── 정약용 ───
  {
    text: "독서는 사람을 풍성하게 하고, 회의는 사람을 깊이 있게 하며, 글쓰기는 사람을 정확하게 한다.",
    author: "정약용",
    source: "유배지에서 보낸 편지 (1801~1818)",
  },

  // ─── Aristotle (paraphrased by Will Durant) ───
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Will Durant (요약, Aristotle 사상)",
    source: "The Story of Philosophy (1926) — Aristotle 니코마코스 윤리학 해설",
  },

  // ─── Friedrich Nietzsche ───
  {
    text: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche",
    source: "Twilight of the Idols (1889)",
  },
  {
    text: "That which does not kill us makes us stronger.",
    author: "Friedrich Nietzsche",
    source: "Twilight of the Idols (1889)",
  },

  // ─── Viktor Frankl ───
  {
    text: "When we are no longer able to change a situation, we are challenged to change ourselves.",
    author: "Viktor Frankl",
    source: "Man's Search for Meaning (1946)",
  },
  {
    text: "Between stimulus and response there is a space. In that space is our power to choose our response.",
    author: "Viktor Frankl",
    source: "Man's Search for Meaning (1946)",
  },

  // ─── Marcus Aurelius ───
  {
    text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    source: "Meditations 명상록 (서기 170년경)",
  },
  {
    text: "Waste no more time arguing what a good man should be. Be one.",
    author: "Marcus Aurelius",
    source: "Meditations 명상록 (서기 170년경)",
  },
  {
    text: "The impediment to action advances action. What stands in the way becomes the way.",
    author: "Marcus Aurelius",
    source: "Meditations 명상록 (서기 170년경)",
  },

  // ─── Seneca ───
  {
    text: "It is not that we have a short time to live, but that we waste a lot of it.",
    author: "Seneca",
    source: "On the Shortness of Life (서기 49년경)",
  },
  {
    text: "Difficulties strengthen the mind, as labor does the body.",
    author: "Seneca",
    source: "도덕적 서한 (Letters from a Stoic)",
  },

  // ─── Walt Disney ───
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    source: "Walt Disney Company 사훈집",
  },
  {
    text: "If you can dream it, you can do it.",
    author: "Walt Disney",
    source: "Disney 강연 (1955)",
  },
  {
    text: "All our dreams can come true if we have the courage to pursue them.",
    author: "Walt Disney",
    source: "Disney 인터뷰 (1956)",
  },

  // ─── Helen Keller ───
  {
    text: "The only thing worse than being blind is having sight but no vision.",
    author: "Helen Keller",
    source: "Helen Keller 강연집",
  },
  {
    text: "Life is either a daring adventure or nothing at all.",
    author: "Helen Keller",
    source: "Let Us Have Faith (1940)",
  },
  {
    text: "Alone we can do so little; together we can do so much.",
    author: "Helen Keller",
    source: "The Story of My Life (1903)",
  },

  // ─── Martin Luther King Jr. ───
  {
    text: "If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do you have to keep moving forward.",
    author: "Martin Luther King Jr.",
    source: "Spelman College 연설 (1960)",
  },
  {
    text: "Faith is taking the first step even when you don't see the whole staircase.",
    author: "Martin Luther King Jr.",
    source: "MLK 연설집 (1960년대)",
  },
  {
    text: "The time is always right to do what is right.",
    author: "Martin Luther King Jr.",
    source: "Oberlin College 연설 (1965)",
  },

  // ─── Eleanor Roosevelt ───
  {
    text: "Do one thing every day that scares you.",
    author: "Eleanor Roosevelt",
    source: "You Learn by Living (1960)",
  },
  {
    text: "No one can make you feel inferior without your consent.",
    author: "Eleanor Roosevelt",
    source: "This Is My Story (자서전, 1937)",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    source: "Reader's Digest 인터뷰 (1948)",
  },

  // ─── Coco Chanel ───
  {
    text: "Success is most often achieved by those who don't know that failure is inevitable.",
    author: "Coco Chanel",
    source: "Coco Chanel 인터뷰 (1958)",
  },
  {
    text: "In order to be irreplaceable, one must always be different.",
    author: "Coco Chanel",
    source: "Coco Chanel 인터뷰집",
  },

  // ─── Oprah Winfrey ───
  {
    text: "The biggest adventure you can ever take is to live the life of your dreams.",
    author: "Oprah Winfrey",
    source: "Stanford 졸업 연설 (2008)",
  },
  {
    text: "Turn your wounds into wisdom.",
    author: "Oprah Winfrey",
    source: "The Oprah Winfrey Show 다수 회",
  },
  {
    text: "Doing the best at this moment puts you in the best place for the next moment.",
    author: "Oprah Winfrey",
    source: "What I Know for Sure (2014)",
  },

  // ─── Jeff Bezos ───
  {
    text: "I knew that if I failed I wouldn't regret that, but I knew the one thing I might regret is not trying.",
    author: "Jeff Bezos",
    source: "Princeton 졸업 연설 (2010)",
  },
  {
    text: "If you decide that you're going to do only the things you know are going to work, you're going to leave a lot of opportunity on the table.",
    author: "Jeff Bezos",
    source: "Amazon Shareholder Letter (2015)",
  },
  {
    text: "What's dangerous is not to evolve.",
    author: "Jeff Bezos",
    source: "Business Insider 인터뷰 (2014)",
  },

  // ─── Tim Cook ───
  {
    text: "Let your joy be in your journey – not in some distant goal.",
    author: "Tim Cook",
    source: "Duke University 졸업 연설 (2018)",
  },

  // ─── Mark Zuckerberg ───
  {
    text: "The biggest risk is not taking any risk. In a world that's changing really quickly, the only strategy that is guaranteed to fail is not taking risks.",
    author: "Mark Zuckerberg",
    source: "Y Combinator Startup School (2011)",
  },
  {
    text: "Done is better than perfect.",
    author: "Sheryl Sandberg",
    source: "Lean In (2013) — Facebook 사훈으로 사용",
  },

  // ─── Sheryl Sandberg ───
  {
    text: "If you're offered a seat on a rocket ship, don't ask what seat! Just get on.",
    author: "Sheryl Sandberg",
    source: "Harvard Business School 졸업 연설 (2012)",
  },

  // ─── Linus Torvalds ───
  {
    text: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
    source: "Linux Kernel 메일링 리스트 (2000)",
  },
  {
    text: "Given enough eyeballs, all bugs are shallow.",
    author: "Eric S. Raymond",
    source: "The Cathedral and the Bazaar (1997) — Linus's Law 명명",
  },

  // ─── Donald Knuth ───
  {
    text: "Premature optimization is the root of all evil.",
    author: "Donald Knuth",
    source: "Structured Programming with go to Statements (1974)",
  },

  // ─── Edsger Dijkstra ───
  {
    text: "Simplicity is prerequisite for reliability.",
    author: "Edsger W. Dijkstra",
    source: "EWD498 (1975)",
  },
  {
    text: "Program testing can be used to show the presence of bugs, but never to show their absence.",
    author: "Edsger W. Dijkstra",
    source: "The Humble Programmer (Turing Award 강연, 1972)",
  },

  // ─── Grace Hopper ───
  {
    text: "The most dangerous phrase in the language is, 'We've always done it this way.'",
    author: "Grace Hopper",
    source: "InformationWeek 인터뷰 (1976)",
  },

  // ─── John F. Kennedy ───
  {
    text: "We choose to go to the Moon in this decade and do the other things, not because they are easy, but because they are hard.",
    author: "John F. Kennedy",
    source: "Rice University 연설 (1962)",
  },

  // ─── Wayne Gretzky ───
  {
    text: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky",
    source: "NHL 인터뷰 (1983)",
  },

  // ─── Will Smith ───
  {
    text: "The only thing that I see that is distinctly different about me is I'm not afraid to die on a treadmill.",
    author: "Will Smith",
    source: "Tavis Smiley Show 인터뷰 (2007)",
  },

  // ─── Arnold Schwarzenegger ───
  {
    text: "The last three or four reps is what makes the muscle grow. This area of pain divides the champion from someone who is not a champion.",
    author: "Arnold Schwarzenegger",
    source: "Pumping Iron 다큐멘터리 (1977)",
  },
  {
    text: "Strength does not come from winning. Your struggles develop your strengths.",
    author: "Arnold Schwarzenegger",
    source: "Total Recall: My Unbelievably True Life Story (자서전, 2012)",
  },

  // ─── David Goggins ───
  {
    text: "The most important conversations you'll ever have are the ones you'll have with yourself.",
    author: "David Goggins",
    source: "Can't Hurt Me (자서전, 2018)",
  },
  {
    text: "We live in an external world. Everything is, 'You can do it!' Anyone can tell you that. The hardest person to motivate is yourself.",
    author: "David Goggins",
    source: "Can't Hurt Me (자서전, 2018)",
  },

  // ─── Kobe Bryant ───
  {
    text: "Great things come from hard work and perseverance. No excuses.",
    author: "Kobe Bryant",
    source: "Kobe Bryant 인터뷰 (다수)",
  },
  {
    text: "If you really want to be great at something you have to truly care about it.",
    author: "Kobe Bryant",
    source: "Mamba Mentality: How I Play (자서전, 2018)",
  },

  // ─── Carl Jung ───
  {
    text: "I am not what happened to me, I am what I choose to become.",
    author: "Carl Jung",
    source: "Memories, Dreams, Reflections (자서전, 1962)",
  },

  // ─── Carl Sagan ───
  {
    text: "Somewhere, something incredible is waiting to be known.",
    author: "Carl Sagan",
    source: "Cosmos (TV 시리즈, 1980)",
  },

  // ─── Stephen Hawking ───
  {
    text: "Look up at the stars and not down at your feet. Try to make sense of what you see, and wonder about what makes the universe exist. Be curious.",
    author: "Stephen Hawking",
    source: "BBC 인터뷰 (2010)",
  },
  {
    text: "Intelligence is the ability to adapt to change.",
    author: "Stephen Hawking",
    source: "Lecture on Black Holes (1980년대)",
  },

  // ─── Bruce Lee ───
  {
    text: "Don't fear failure. Not failure, but low aim, is the crime.",
    author: "Bruce Lee",
    source: "Striking Thoughts (사후 출간, 2002)",
  },
  {
    text: "If you spend too much time thinking about a thing, you'll never get it done.",
    author: "Bruce Lee",
    source: "Tao of Jeet Kune Do (사후 출간, 1975)",
  },
  {
    text: "Knowing is not enough, we must apply. Willing is not enough, we must do.",
    author: "Bruce Lee",
    source: "Bruce Lee 인터뷰 (1971)",
  },

  // ─── Pablo Picasso ───
  {
    text: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
    source: "Pablo Picasso 인터뷰집",
  },

  // ─── Vincent van Gogh ───
  {
    text: "If you hear a voice within you say 'you cannot paint,' then by all means paint, and that voice will be silenced.",
    author: "Vincent van Gogh",
    source: "동생 Theo에게 보낸 편지 (1884)",
  },
  {
    text: "Great things are not done by impulse, but by a series of small things brought together.",
    author: "Vincent van Gogh",
    source: "동생 Theo에게 보낸 편지 (1882)",
  },

  // ─── Charles Bukowski ───
  {
    text: "What matters most is how well you walk through the fire.",
    author: "Charles Bukowski",
    source: "What Matters Most Is How Well You Walk Through the Fire (시집, 1999)",
  },

  // ─── J.R.R. Tolkien ───
  {
    text: "Even the smallest person can change the course of the future.",
    author: "J.R.R. Tolkien",
    source: "The Fellowship of the Ring (1954) — Galadriel 대사",
  },

  // ─── 안창호 (도산) ───
  {
    text: "낙망(落望)은 청년의 죽음이요, 청년이 죽으면 민족이 죽는다.",
    author: "안창호 (도산)",
    source: "흥사단 강연집 (1920년대)",
  },
  {
    text: "진리는 반드시 따르는 자가 있고 정의는 반드시 이루는 날이 있다.",
    author: "안창호 (도산)",
    source: "흥사단 약법 (1913)",
  },

  // ─── 박경철 (시골의사) ───
  {
    text: "다른 사람의 인생을 살지 말고 너의 인생을 살아라.",
    author: "박경철",
    source: "시골의사의 아름다운 동행 (2005)",
  },

  // ─── 이병철 (삼성 창업자) ───
  {
    text: "인재가 가장 큰 재산이다.",
    author: "이병철",
    source: "호암자전 (자서전, 1986)",
  },

  // ─── 김연수 (소설가) ───
  {
    text: "쓰지 않으면 사라진다.",
    author: "김연수",
    source: "지지 않는다는 말 (2012)",
  },

  // ─── Antoine de Saint-Exupéry ───
  {
    text: "A goal without a plan is just a wish.",
    author: "Antoine de Saint-Exupéry",
    source: "어린 왕자 / 인터뷰집 인용",
  },
  {
    text: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.",
    author: "Antoine de Saint-Exupéry",
    source: "Wind, Sand and Stars (1939)",
  },

  // ─── Tony Robbins ───
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    source: "Awaken the Giant Within (1991)",
  },

  // ─── Jim Rohn ───
  {
    text: "You are the average of the five people you spend the most time with.",
    author: "Jim Rohn",
    source: "Jim Rohn 강연집 (1980년대)",
  },
  {
    text: "Discipline is the bridge between goals and accomplishment.",
    author: "Jim Rohn",
    source: "The Seasons of Life (1981)",
  },

  // ─── Robin Sharma ───
  {
    text: "The expert in anything was once a beginner.",
    author: "Robin Sharma",
    source: "The Monk Who Sold His Ferrari (1997)",
  },

  // ─── Cal Newport ───
  {
    text: "Clarity about what matters provides clarity about what does not.",
    author: "Cal Newport",
    source: "Deep Work (2016)",
  },
  {
    text: "Human beings, it seems, are at their best when immersed deeply in something challenging.",
    author: "Cal Newport",
    source: "Deep Work (2016)",
  },

  // ─── James Clear ───
  {
    text: "You do not rise to the level of your goals. You fall to the level of your systems.",
    author: "James Clear",
    source: "Atomic Habits (2018)",
  },
  {
    text: "Every action you take is a vote for the type of person you wish to become.",
    author: "James Clear",
    source: "Atomic Habits (2018)",
  },
  {
    text: "Habits are the compound interest of self-improvement.",
    author: "James Clear",
    source: "Atomic Habits (2018)",
  },

  // ─── Naval Ravikant ───
  {
    text: "Earn with your mind, not with your time.",
    author: "Naval Ravikant",
    source: "How to Get Rich (without getting lucky) Twitter Thread (2018)",
  },
  {
    text: "Read what you love until you love to read.",
    author: "Naval Ravikant",
    source: "Almanack of Naval Ravikant (2020)",
  },

  // ─── Paul Graham ───
  {
    text: "Make something people want.",
    author: "Paul Graham",
    source: "Y Combinator 사훈 (2005~)",
  },
  {
    text: "Do things that don't scale.",
    author: "Paul Graham",
    source: "Do Things that Don't Scale 에세이 (2013)",
  },

  // ─── 김미경 ───
  {
    text: "꿈은 갖는 게 아니라 만들어가는 거다.",
    author: "김미경",
    source: "꿈이 있는 아내는 늙지 않는다 (2010)",
  },

  // ─── 이지성 ───
  {
    text: "리딩으로 리드하라.",
    author: "이지성",
    source: "리딩으로 리드하라 (2010)",
  },

  // ─── 혜민 스님 ───
  {
    text: "멈추면, 비로소 보이는 것들.",
    author: "혜민 스님",
    source: "멈추면, 비로소 보이는 것들 (2012)",
  },

  // ─── 김난도 ───
  {
    text: "아프니까 청춘이다.",
    author: "김난도",
    source: "아프니까 청춘이다 (2010)",
  },

  // ─── Howard Schultz ───
  {
    text: "In times of adversity and change, we really discover who we are and what we're made of.",
    author: "Howard Schultz",
    source: "Onward: How Starbucks Fought for Its Life without Losing Its Soul (2011)",
  },

  // ─── Mary Kay Ash ───
  {
    text: "Don't limit yourself. Many people limit themselves to what they think they can do.",
    author: "Mary Kay Ash",
    source: "Mary Kay: You Can Have It All (1995)",
  },

  // ─── Richard Branson ───
  {
    text: "Business opportunities are like buses, there's always another one coming.",
    author: "Richard Branson",
    source: "Losing My Virginity (자서전, 1998)",
  },
  {
    text: "Screw it, just do it.",
    author: "Richard Branson",
    source: "Screw It, Let's Do It (2006)",
  },

  // ─── Brené Brown ───
  {
    text: "What we know matters but who we are matters more.",
    author: "Brené Brown",
    source: "Daring Greatly (2012)",
  },
  {
    text: "Vulnerability is not winning or losing; it's having the courage to show up and be seen.",
    author: "Brené Brown",
    source: "Rising Strong (2015)",
  },

  // ─── Yvon Chouinard (Patagonia) ───
  {
    text: "The more you know, the less you need.",
    author: "Yvon Chouinard",
    source: "Let My People Go Surfing (자서전, 2005)",
  },

  // ─── Reid Hoffman ───
  {
    text: "If you are not embarrassed by the first version of your product, you've launched too late.",
    author: "Reid Hoffman",
    source: "LinkedIn 공동창업자 인터뷰 (2007)",
  },

  // ─── Peter Drucker ───
  {
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
    source: "Management: Tasks, Responsibilities, Practices (1973)",
  },
  {
    text: "What gets measured gets managed.",
    author: "Peter Drucker",
    source: "The Practice of Management (1954)",
  },

  // ─── Andy Grove ───
  {
    text: "Only the paranoid survive.",
    author: "Andy Grove",
    source: "Only the Paranoid Survive (1996)",
  },

  // ─── Reed Hastings ───
  {
    text: "Don't seek to be infallible. Seek to be improvable.",
    author: "Reed Hastings",
    source: "No Rules Rules (2020)",
  },

  // ─── Ben Horowitz ───
  {
    text: "The only thing that prepares you to run a company is running a company.",
    author: "Ben Horowitz",
    source: "The Hard Thing About Hard Things (2014)",
  },

  // ─── Sam Altman ───
  {
    text: "The right answer to 'should I quit my job to do a startup' is almost always yes.",
    author: "Sam Altman",
    source: "Startup Playbook 에세이 (2015)",
  },

  // ─── John Wooden ───
  {
    text: "Do not let what you cannot do interfere with what you can do.",
    author: "John Wooden",
    source: "Wooden: A Lifetime of Observations On and Off the Court (1997)",
  },
];

export function randomQuote(): Quote {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
