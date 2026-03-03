import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";

const categories = [
  {
    id: "office",
    label: "Office",
    icon: "💼",
    words: [
      { en: "Can you send me the report?", mr: "तुम्ही मला रिपोर्ट पाठवू शकता का?" },
      { en: "I have a meeting at 3 PM.", mr: "माझी 3 वाजता मीटिंग आहे." },
      { en: "Please check your email.", mr: "कृपया तुमचा ईमेल तपासा." },
      { en: "I need a day off tomorrow.", mr: "मला उद्या सुट्टी हवी आहे." },
      { en: "Let's discuss this in the meeting.", mr: "हे आपण मीटिंगमध्ये बोलूया." },
      { en: "I will complete it by evening.", mr: "मी संध्याकाळपर्यंत पूर्ण करेन." },
      { en: "Can we reschedule the call?", mr: "आपण कॉल पुढे ढकलू शकतो का?" },
      { en: "I agree with your suggestion.", mr: "मी तुमच्या सूचनेशी सहमत आहे." },
    ],
  },
  {
    id: "college",
    label: "College",
    icon: "🎓",
    words: [
      { en: "What is the assignment deadline?", mr: "असाइनमेंटची शेवटची तारीख काय आहे?" },
      { en: "Did you attend today's lecture?", mr: "तू आजच्या लेक्चरला गेलास का?" },
      { en: "I need to study for the exam.", mr: "मला परीक्षेसाठी अभ्यास करायला हवा." },
      { en: "Can I borrow your notes?", mr: "तुझ्या नोट्स मिळतील का?" },
      { en: "The professor explained it well.", mr: "प्रोफेसरांनी छान समजावून सांगितलं." },
      { en: "Let's go to the canteen.", mr: "चल कँटीनला जाऊया." },
      { en: "Which subject do you like the most?", mr: "तुला कोणता विषय सगळ्यात आवडतो?" },
      { en: "I got good marks in the test.", mr: "मला टेस्टमध्ये चांगले मार्क्स मिळाले." },
    ],
  },
  {
    id: "travel",
    label: "Travel",
    icon: "✈️",
    words: [
      { en: "How much is the ticket?", mr: "तिकीट किती आहे?" },
      { en: "Where is the nearest bus stop?", mr: "सगळ्यात जवळचा बस स्टॉप कुठे आहे?" },
      { en: "I want to book a hotel room.", mr: "मला हॉटेलची रूम बुक करायची आहे." },
      { en: "Can you show me on the map?", mr: "तुम्ही मला नकाशावर दाखवू शकता का?" },
      { en: "What time does the train leave?", mr: "ट्रेन किती वाजता सुटते?" },
      { en: "Is there a restaurant nearby?", mr: "जवळपास कोणतं रेस्टॉरंट आहे का?" },
      { en: "I am visiting for the first time.", mr: "मी पहिल्यांदा भेट देत आहे." },
      { en: "The view is beautiful!", mr: "दृश्य खूप सुंदर आहे!" },
    ],
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: "🛍️",
    words: [
      { en: "How much does this cost?", mr: "हे किती रुपयांना आहे?" },
      { en: "Do you have a bigger size?", mr: "तुमच्याकडे मोठा साइज आहे का?" },
      { en: "Can I try this on?", mr: "मी हे ट्राय करू शकतो/शकते का?" },
      { en: "I want to return this item.", mr: "मला हे परत करायचं आहे." },
      { en: "Do you accept card payment?", mr: "तुम्ही कार्ड पेमेंट घेता का?" },
      { en: "Give me a discount please.", mr: "कृपया सूट द्या." },
      { en: "Where is the billing counter?", mr: "बिलिंग काउंटर कुठे आहे?" },
      { en: "I am just looking around.", mr: "मी फक्त बघतोय/बघतेय." },
    ],
  },
  {
    id: "family",
    label: "Family",
    icon: "👨‍👩‍👧‍👦",
    words: [
      { en: "How is everyone at home?", mr: "घरी सगळे कसे आहेत?" },
      { en: "My mother cooks delicious food.", mr: "माझी आई खूप छान जेवण बनवते." },
      { en: "We are planning a family trip.", mr: "आम्ही फॅमिली ट्रिप प्लॅन करतोय." },
      { en: "My brother is older than me.", mr: "माझा भाऊ माझ्यापेक्षा मोठा आहे." },
      { en: "We celebrate festivals together.", mr: "आम्ही सगळे सण एकत्र साजरे करतो." },
      { en: "I miss my grandparents.", mr: "मला आजी-आजोबांची आठवण येते." },
      { en: "My father works very hard.", mr: "माझे वडील खूप मेहनत करतात." },
      { en: "Today is my sister's birthday.", mr: "आज माझ्या बहिणीचा वाढदिवस आहे." },
    ],
  },
  {
    id: "daily",
    label: "Daily",
    icon: "☀️",
    words: [
      { en: "Good morning! How are you?", mr: "सुप्रभात! तू कसा/कशी आहेस?" },
      { en: "I wake up at 7 AM every day.", mr: "मी रोज सकाळी 7 वाजता उठतो/उठते." },
      { en: "What will you have for lunch?", mr: "तू दुपारी काय खाणार/खाणारेस?" },
      { en: "The weather is very nice today.", mr: "आज हवामान खूप छान आहे." },
      { en: "I am going for a walk.", mr: "मी फिरायला जातोय/जातेय." },
      { en: "Can you help me with this?", mr: "तू यात मला मदत करशील का?" },
      { en: "I am feeling tired today.", mr: "आज मला खूप थकवा जाणवतोय." },
      { en: "See you tomorrow! Take care.", mr: "उद्या भेटू! काळजी घे." },
    ],
  },
];

const DailyWords = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("office");

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-display font-bold text-base">Daily Use Words</h2>
          <p className="text-xs text-muted-foreground">English + Marathi sentences</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl mx-auto w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            {categories.slice(0, 3).map((c) => (
              <TabsTrigger key={c.id} value={c.id} className="text-xs">
                {c.icon} {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            {categories.slice(3).map((c) => (
              <TabsTrigger key={c.id} value={c.id} className="text-xs">
                {c.icon} {c.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="space-y-3 mt-2">
              {cat.words.map((w, i) => (
                <Card key={i}>
                  <CardContent className="pt-4 pb-3 space-y-1">
                    <p className="text-sm font-medium">{w.en}</p>
                    <p className="text-sm text-primary">{w.mr}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default DailyWords;
