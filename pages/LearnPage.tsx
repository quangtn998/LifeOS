import React from 'react';
import Card from '../components/Card';

const content = [
  {
    title: "Introduction: Welcome to LifeOS",
    text: "Welcome to LifeOS – The Comprehensive Life Operating System, designed to help you manage time, maintain balance, and achieve your goals, all while enjoying the journey. LifeOS is built on two foundational pillars: Vision and Action."
  },
  {
    title: "Part I: Vision - Defining Your North Star",
    chapters: [
      {
        title: "Chapter 1: Life Compass",
        text: "The Life Compass is the tool that helps you define your 'North Star'. We will use four exercises: The Eulogy Method, The Bucket List, The Mission Prompt, and The Success Prompt."
      },
      {
        title: "Chapter 2: Future Sketch",
        text: "If the 'Life Compass' is your long-term vision, the 'Future Sketch' is your medium-term (3-5 years) vision. It includes four components: the 3-Year Dream, the Odyssey Plan, the Vision Board, and the Future Calendar."
      },
      {
        title: "Chapter 3: Quarterly Quests",
        text: "This is the bridge between Vision and Action. The 90-day timeframe is the perfect 'sweet spot'. We will define one Main Quest and up to three Side Quests for both Work and Life."
      }
    ]
  },
  {
    title: "Part II: Action - Turning Vision into Reality",
    chapters: [
      {
        title: "Chapter 4: The Focused Hour Formula",
        text: "The atomic unit of action. The formula is 5-50-5: 5 minutes for Planning, 50 minutes for Focusing, and 5 minutes for Reflecting & Recharging. Track your focus minutes with a Focus Log."
      },
      {
        title: "Chapter 5: Designing Productive Days",
        text: "Live proactively with the Productive Day Protocol: Start with a Morning Manifesto (5 mins), execute 3-5 Focus Hours, and end with an Evening Shutdown ritual (5 mins)."
      },
      {
        title: "Chapter 6: Balanced Weeks",
        text: "Work sustainably. Use two tools: the Weekly Review (15 mins) and the Ideal Week Calendar to design a perfect week of work and rest."
      }
    ]
  }
];

const LearnPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">The LifeOS Framework</h1>
      <p className="text-gray-400 max-w-3xl">
        This is a summary of the core concepts behind LifeOS. Use these principles to guide your planning and actions within the app. Revisit this page anytime you need to reconnect with the foundational ideas.
      </p>

      {content.map((section, index) => (
        <Card key={index} className="p-0 overflow-hidden">
          <div className="p-6 bg-gray-800/50">
            <h2 className="text-2xl font-bold text-white">{section.title}</h2>
            {section.text && <p className="mt-2 text-gray-400">{section.text}</p>}
          </div>
          {section.chapters && (
            <div className="space-y-4 p-6">
              {section.chapters.map((chapter, chapIndex) => (
                <div key={chapIndex} className="p-4 border-l-4 border-cyan-500 bg-gray-900/30 rounded-r-lg">
                  <h3 className="font-semibold text-white">{chapter.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">{chapter.text}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default LearnPage;