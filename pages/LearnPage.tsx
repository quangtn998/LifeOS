import React, { useState } from 'react';
import Card from '../components/Card';
import { ChevronDownIcon, ChevronUpIcon } from '../components/icons/Icons';

const content = [
  {
    title: "Introduction: Welcome to LifeOS",
    text: "Welcome to LifeOS – The Comprehensive Life Operating System, designed to help you manage time, maintain balance, and achieve your goals, all while enjoying the journey. LifeOS is built on two foundational pillars: Vision and Action.",
    details: "This framework combines proven productivity methodologies with intentional living principles. The goal is not just to get more done, but to do the right things that align with who you want to become. LifeOS helps you bridge the gap between your dreams and daily actions through a structured, yet flexible approach."
  },
  {
    title: "Part I: Vision - Defining Your North Star",
    text: "Your Vision is your compass. Without it, you're just drifting. These tools help you define what matters most.",
    chapters: [
      {
        title: "Chapter 1: Life Compass",
        text: "The Life Compass is the tool that helps you define your 'North Star'. We will use core exercises to clarify your values and direction.",
        subsections: [
          {
            subtitle: "The Eulogy Method",
            description: "Imagine you're at your own funeral. What do you want people to say about you? This exercise helps you identify the legacy you want to leave and the person you want to become."
          },
          {
            subtitle: "The Bucket List",
            description: "List the experiences you want to have before you die. This isn't just about travel – it's about the full spectrum of human experiences: relationships, achievements, adventures, and contributions."
          },
          {
            subtitle: "The Mission Prompt",
            description: "Define your personal mission statement. What is your purpose? What unique contribution can you make to the world? This becomes your guiding principle for major life decisions."
          },
          {
            subtitle: "The Success Prompt",
            description: "What does success truly mean to you? Not society's definition, but yours. This helps you avoid climbing the wrong ladder and ensures your goals align with your values."
          },
          {
            subtitle: "Role Models",
            description: "Identify people who embody qualities you admire. What do they do that you want to emulate? What behaviors should you avoid? Learn from their successes and mistakes."
          },
          {
            subtitle: "Who to Become",
            description: "Design your future identity. Who is the person capable of achieving your goals? What traits do they have? What sacrifices are required? Be honest about the costs of transformation."
          },
          {
            subtitle: "Important Things & Principles",
            description: "Document the non-negotiables in your life and the principles that guide your decisions. These become your decision-making framework during challenging times."
          }
        ]
      },
      {
        title: "Chapter 2: Future Sketch",
        text: "If the 'Life Compass' is your long-term vision, the 'Future Sketch' is your medium-term (3-5 years) vision. It bridges the gap between dreams and reality.",
        subsections: [
          {
            subtitle: "The 3-Year Dream",
            description: "Where do you want to be in three years? Be specific. What does your ideal day look like? What projects have you completed? What relationships have you built? Write it as if it's already happened."
          },
          {
            subtitle: "The Odyssey Plan",
            description: "Design three different 5-year paths for your life. Track 1: Your current path. Track 2: If your current path disappeared. Track 3: If money and societal expectations didn't matter. This exercise reveals hidden desires and alternative possibilities."
          },
          {
            subtitle: "The Vision Board",
            description: "Create a visual representation of your future. Use images that inspire you and represent the life you're building. Place it somewhere you'll see daily as a constant reminder of what you're working toward."
          },
          {
            subtitle: "The Future Calendar",
            description: "Project your ideal future schedule. How do you spend your time in your dream life? What does a typical week look like? This helps you start designing your days to match your vision."
          }
        ]
      },
      {
        title: "Chapter 3: Quarterly Quests",
        text: "This is the bridge between Vision and Action. The 90-day timeframe is the perfect 'sweet spot' – long enough to achieve meaningful results, short enough to maintain focus.",
        subsections: [
          {
            subtitle: "Main Quests",
            description: "Choose ONE main quest for Work and ONE for Life each quarter. This is your primary focus. Everything else is secondary. A main quest should be ambitious, exciting, and aligned with your long-term vision."
          },
          {
            subtitle: "Side Quests",
            description: "These support your main quest or address other important areas. Limit to 2-3 side quests per category. Too many side quests dilute your focus from the main quest."
          },
          {
            subtitle: "Quarterly Battlefield Assessment",
            description: "At the start of each quarter, assess the landscape for both Work and Life. What are the challenges? What resources do you have? What's the strategic approach? This is your quarterly planning session."
          },
          {
            subtitle: "Work Assessment Framework",
            description: "Step 1: Analyze terrain & weather (market conditions, team dynamics). Step 2: Conduct frontline review (current projects, sprint goals). Step 3: Plan weekly actions (tactical execution, weekly huddles)."
          },
          {
            subtitle: "Life Assessment Framework",
            description: "Step 1: Personal SWOT analysis (strengths, weaknesses, opportunities, threats). Step 2: Monthly milestones (health, relationships, personal growth). Step 3: Weekly self-reflection (what's working, what needs adjustment)."
          }
        ]
      }
    ]
  },
  {
    title: "Part II: Action - Turning Vision into Reality",
    text: "Vision without action is just a dream. Action without vision is wasted effort. Here's how to bridge the gap.",
    chapters: [
      {
        title: "Chapter 4: The Focus Hour Formula",
        text: "The atomic unit of action. This is where the real work happens. Master this, and you master productivity.",
        subsections: [
          {
            subtitle: "The 5-50-5 Formula",
            description: "5 minutes Planning & Organizing: Set one clear goal. What exactly will you accomplish? Clear your workspace. Eliminate distractions. 50 minutes of Deep Focus: No interruptions. Single-task. Capture distracting thoughts without acting on them. 5 minutes Reflect & Recharge: What worked? What distracted you? How can you improve next time? Then truly rest."
          },
          {
            subtitle: "Plan & Organize (5 mins)",
            description: "Write down ONE specific goal for this session. Not 'work on project' but 'complete section 2 of the proposal'. A cluttered desk leads to a cluttered mind – spend 1-2 minutes organizing your workspace. Close unnecessary tabs and apps."
          },
          {
            subtitle: "Focus (50 mins)",
            description: "This is your sacred time. Protect it fiercely. Use the Focus Toolkit when you need activation or reactivation. Track disruptors (procrastination, distraction, burnout, perfectionism) to identify patterns. Capture intrusive thoughts in your capture system without breaking focus."
          },
          {
            subtitle: "Reflect & Recharge (5 mins)",
            description: "Write a brief reflection: What worked? What didn't? What will you do differently next time? Choose a recharge activity: walk, stretch, breathe, or any activity that genuinely refreshes you. Don't skip this – it prevents burnout and improves your next session."
          },
          {
            subtitle: "Focus Toolkit",
            description: "Activation Menu (to start): Listen to focus music, do breathing exercises, tackle an easy task first. Reactivation Menu (to refocus): Take a 60-second movement break, change your music or scenery, remove your phone from the room. Customize based on what works for you."
          },
          {
            subtitle: "Focus Disruptors",
            description: "Track when you feel: Procrastination (fear of starting), Distraction (external interruptions), Burnout (exhaustion, no energy), Perfectionism (fear of imperfection). Understanding your patterns helps you develop counter-strategies."
          },
          {
            subtitle: "The Focus Log",
            description: "Track your focus minutes daily. Aim for 3-5 focus hours per day (180-300 minutes). This isn't about perfection – it's about consistency. The visual history shows your effort over time and helps you maintain momentum."
          }
        ]
      },
      {
        title: "Chapter 5: Designing Productive Days",
        text: "Live proactively. Don't let the day happen to you – design it. The Productive Day Protocol ensures every day moves you toward your goals.",
        subsections: [
          {
            subtitle: "Morning Manifesto (5 mins)",
            description: "How am I feeling? Check in with yourself honestly. What am I grateful for? Start with appreciation – it sets a positive tone. What is my adventure today? Define your ONE most important task (MIT). This becomes your focus for the day."
          },
          {
            subtitle: "Focus Tasks",
            description: "List 3-5 tasks that must get done today. These should align with your quarterly quests. Prioritize ruthlessly – not everything is equally important. Check tasks off as you complete them for a sense of progress."
          },
          {
            subtitle: "Execute 3-5 Focus Hours",
            description: "Your day should include 3-5 focus hours using the 5-50-5 formula. Schedule these during your peak energy hours. Protect this time like important meetings – because they are. Everything else fits around your focus hours."
          },
          {
            subtitle: "Evening Shutdown (5 mins)",
            description: "What did I accomplish today? Celebrate wins, no matter how small. What did I learn? Extract lessons from both successes and failures. What's the plan for tomorrow? Set yourself up for success by clarifying tomorrow's adventure. This ritual signals to your brain that work is done."
          },
          {
            subtitle: "The Golden Thread",
            description: "Your daily adventure should connect to your weekly priorities, which connect to your quarterly quests, which align with your long-term vision. This creates coherence and meaning in your daily actions."
          }
        ]
      },
      {
        title: "Chapter 6: Balanced Weeks",
        text: "Work sustainably. A great week isn't about working every waking hour – it's about working intentionally and resting effectively.",
        subsections: [
          {
            subtitle: "Weekly Review (15 mins)",
            description: "Conduct this every Sunday or Monday. Review wins & accomplishments: What went well? Celebrate progress. Analyze challenges & lessons: What didn't work? What can you learn? Set top 3-5 priorities for next week: What are the most important actions? Check quest status: Are you on track with your quarterly goals? Adjust your approach if needed."
          },
          {
            subtitle: "The Ideal Week Calendar",
            description: "Design a template for your perfect week. Block time for: Deep work (your focus hours), Meetings & collaboration, Exercise & health, Relationships & social time, Rest & recovery, Personal projects. Use this as your default schedule and protect these blocks."
          },
          {
            subtitle: "The Golden Thread (Weekly)",
            description: "Link your weekly priorities to your quarterly quests. During your weekly review, ask: 'Did my actions this week move me closer to my quarterly goals?' If not, adjust your priorities for the coming week."
          },
          {
            subtitle: "Sustainable Pace",
            description: "You can't sprint for 90 days. Build in recovery: One complete rest day per week (no work, no side hustles), Regular buffer time for unexpected issues, Longer breaks between quarters to recharge. Burnout is not a badge of honor – it's a sign of poor planning."
          }
        ]
      }
    ]
  },
  {
    title: "The LifeOS Workflow: Putting It All Together",
    text: "Here's how the entire system flows from vision to daily action:",
    subsections: [
      {
        subtitle: "Annual: Set Your North Star",
        description: "Once a year, revisit your Life Compass and Future Sketch. Update your vision as you grow and change. This should happen during a dedicated retreat or extended reflection period."
      },
      {
        subtitle: "Quarterly: Define Your Quests",
        description: "Every 90 days, conduct your Battlefield Assessment and set your Main and Side Quests. Review progress on previous quests. Adjust your approach based on what you learned."
      },
      {
        subtitle: "Weekly: Review & Plan",
        description: "Every week, conduct your Weekly Review. Celebrate wins, analyze challenges, and set priorities for the coming week. Ensure your weekly priorities align with your quarterly quests."
      },
      {
        subtitle: "Daily: Execute With Focus",
        description: "Every morning, complete your Morning Manifesto. Execute 3-5 focus hours. Every evening, complete your Evening Shutdown. Keep the golden thread visible – know how today connects to your larger goals."
      },
      {
        subtitle: "Hourly: The Focused Hour",
        description: "Each focus session follows the 5-50-5 formula. Plan, execute, reflect, recharge. Track your focus minutes. Over time, these hours compound into extraordinary results."
      }
    ]
  },
  {
    title: "Core Principles of LifeOS",
    text: "These fundamental principles guide the entire system:",
    subsections: [
      {
        subtitle: "Intentionality Over Intensity",
        description: "It's not about working harder or longer – it's about working on the right things. Clarity of purpose beats frantic effort every time."
      },
      {
        subtitle: "Systems Over Goals",
        description: "Goals are important for direction, but systems are what get you there. Focus on building sustainable habits and processes, not just chasing outcomes."
      },
      {
        subtitle: "Balance Is Dynamic, Not Static",
        description: "Balance doesn't mean equal time in all areas. Sometimes work demands more, sometimes life does. The key is intentional imbalance – making conscious choices rather than defaulting to whatever screams loudest."
      },
      {
        subtitle: "Rest Is Productive",
        description: "Rest isn't wasted time – it's essential for sustained high performance. Your brain needs recovery to function at its best. Schedule rest with the same commitment as you schedule work."
      },
      {
        subtitle: "Reflection Drives Growth",
        description: "Without reflection, you're just repeating the same patterns. Regular review at all levels (hourly, daily, weekly, quarterly) is what turns experience into wisdom."
      },
      {
        subtitle: "Progress Over Perfection",
        description: "Done is better than perfect. Perfectionism is often just fear in disguise. Ship your work, get feedback, improve. Iteration beats procrastination."
      },
      {
        subtitle: "The Golden Thread",
        description: "Every action should connect to something bigger. Your hourly focus connects to daily tasks, which connect to weekly priorities, which align with quarterly quests, which serve your long-term vision. When you lose this thread, you lose meaning."
      }
    ]
  }
];

const ChapterSection: React.FC<{ chapter: any }> = ({ chapter }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-l-4 border-cyan-500 bg-gray-900/30 rounded-r-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-gray-900/50 transition-colors flex items-center justify-between"
      >
        <div className="flex-1">
          <h3 className="font-semibold text-white">{chapter.title}</h3>
          <p className="mt-1 text-sm text-gray-400">{chapter.text}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5 text-cyan-400" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-cyan-400" />
          )}
        </div>
      </button>

      {isExpanded && chapter.subsections && (
        <div className="px-4 pb-4 space-y-3">
          {chapter.subsections.map((subsection: any, idx: number) => (
            <div key={idx} className="p-3 bg-gray-800/50 rounded-lg">
              <h4 className="font-semibold text-cyan-300 text-sm">{subsection.subtitle}</h4>
              <p className="mt-2 text-sm text-gray-300 leading-relaxed">{subsection.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LearnPage: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">The LifeOS Framework</h1>
        <p className="mt-4 text-gray-400 max-w-4xl leading-relaxed">
          This is your comprehensive guide to the LifeOS methodology. Use these principles to guide your planning and actions within the app. Each section expands to reveal detailed explanations and practical guidance. Revisit this page anytime you need to reconnect with the foundational ideas or learn how to use specific features.
        </p>
      </div>

      {content.map((section, index) => (
        <Card key={index} className="p-0 overflow-hidden">
          <button
            onClick={() => toggleSection(index)}
            className="w-full p-6 bg-gray-800/50 hover:bg-gray-800/70 transition-colors text-left flex items-center justify-between"
          >
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{section.title}</h2>
              {section.text && <p className="mt-2 text-gray-400">{section.text}</p>}
            </div>
            <div className="ml-4 flex-shrink-0">
              {expandedSections.has(index) ? (
                <ChevronUpIcon className="w-6 h-6 text-cyan-400" />
              ) : (
                <ChevronDownIcon className="w-6 h-6 text-cyan-400" />
              )}
            </div>
          </button>

          {expandedSections.has(index) && (
            <div className="p-6 pt-0">
              {section.details && (
                <div className="mb-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <p className="text-sm text-gray-300 leading-relaxed">{section.details}</p>
                </div>
              )}

              {section.chapters && (
                <div className="space-y-4">
                  {section.chapters.map((chapter: any, chapIndex: number) => (
                    <ChapterSection key={chapIndex} chapter={chapter} />
                  ))}
                </div>
              )}

              {section.subsections && (
                <div className="space-y-3">
                  {section.subsections.map((subsection: any, subIdx: number) => (
                    <div key={subIdx} className="p-4 bg-gray-900/30 rounded-lg border-l-4 border-cyan-500">
                      <h3 className="font-semibold text-cyan-300">{subsection.subtitle}</h3>
                      <p className="mt-2 text-sm text-gray-300 leading-relaxed">{subsection.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      ))}

      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30">
        <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>
        <div className="space-y-3 text-gray-300">
          <p className="leading-relaxed">
            <span className="font-semibold text-cyan-400">New to LifeOS?</span> Start by defining your Life Compass. Spend quality time on the core exercises – they form the foundation for everything else.
          </p>
          <p className="leading-relaxed">
            <span className="font-semibold text-cyan-400">Already have a vision?</span> Set your Quarterly Quests and start tracking your daily focus hours. Consistency in small actions compounds into extraordinary results.
          </p>
          <p className="leading-relaxed">
            <span className="font-semibold text-cyan-400">Feeling overwhelmed?</span> Remember: this is a marathon, not a sprint. Start with just one focus hour per day. Master that, then expand. Progress over perfection.
          </p>
          <p className="mt-4 text-sm text-gray-400 italic">
            The Golden Thread: Every hour of focused work → connects to your daily plan → which serves your weekly priorities → which advance your quarterly quests → which align with your long-term vision. When you see this connection, every action becomes meaningful.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LearnPage;