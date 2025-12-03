import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { 
  BookOpen, 
  Database, 
  Plus, 
  Code, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Trash2, 
  Terminal,
  Layout,
  MessageSquare
} from 'lucide-react';

/* ===================================================================
  SECTION 1: FIREBASE CONFIGURATION & SERVICES
  ===================================================================
*/

// LOCAL ENVIRONMENT: Direct configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appId = 'devstudy-local'; // Fixed app ID for local environment

// Auth Initialization
const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };

    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  return user;
};

/* ===================================================================
  SECTION 2: DATA HANDLING (CUSTOM HOOKS)
  ===================================================================
*/

// Generic hook to fetch collections based on parent ID
const useDataCollection = (user, collectionName, parentField, parentId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !parentId) {
      if (!parentId) setData([]); // Clear if no parent selected
      setLoading(false);
      return;
    }

    const colRef = collection(db, 'artifacts', appId, 'public', 'data', collectionName);
    const q = query(colRef, where(parentField, '==', parentId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by timestamp descending in memory
      items.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setData(items);
      setLoading(false);
    }, (error) => {
      console.error(`Error fetching ${collectionName}:`, error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, collectionName, parentField, parentId]);

  return { data, loading };
};

const addItem = async (user, collectionName, data) => {
  if (!user) return;
  const colRef = collection(db, 'artifacts', appId, 'public', 'data', collectionName);
  await addDoc(colRef, {
    ...data,
    userId: user.uid,
    timestamp: serverTimestamp()
  });
};

const deleteItem = async (user, collectionName, itemId) => {
  if (!user) return;
  const docRef = doc(db, 'artifacts', appId, 'public', 'data', collectionName, itemId);
  await deleteDoc(docRef);
};

/* ===================================================================
  SECTION 3: UI COMPONENTS
  ===================================================================
*/

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon }) => {
  const baseStyle = "flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-md",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Plus className="w-6 h-6 transform rotate-45" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const CodeBlock = ({ code }) => (
  <div className="relative group rounded-lg overflow-hidden my-3 border border-gray-700 shadow-lg">
    <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
      </div>
      <span className="text-xs text-gray-400 font-mono ml-2">solution.js</span>
    </div>
    <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm font-mono leading-relaxed">
      <code>{code}</code>
    </pre>
  </div>
);

/* ===================================================================
  SECTION 4: FEATURE COMPONENTS
  ===================================================================
*/

// 4.1 Solution Component
const SolutionItem = ({ solution, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3 shadow-sm hover:shadow-md transition-shadow relative group">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-500 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${solution.type === 'code' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
          {solution.type}
        </span>
        <span className="text-xs text-gray-400">
          Added {solution.timestamp?.seconds ? new Date(solution.timestamp.seconds * 1000).toLocaleDateString() : 'Just now'}
        </span>
      </div>

      {solution.type === 'code' ? (
        <CodeBlock code={solution.content} />
      ) : (
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{solution.content}</p>
      )}
    </div>
  );
};

// 4.2 Question Component
const QuestionCard = ({ user, question, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [showAddSolution, setShowAddSolution] = useState(false);
  const [newSolutionContent, setNewSolutionContent] = useState('');
  const [newSolutionType, setNewSolutionType] = useState('text');
  
  const { data: solutions } = useDataCollection(user, 'solutions', 'questionId', question.id);

  const handleAddSolution = async (e) => {
    e.preventDefault();
    if (!newSolutionContent.trim()) return;
    
    await addItem(user, 'solutions', {
      questionId: question.id,
      content: newSolutionContent,
      type: newSolutionType
    });
    
    setNewSolutionContent('');
    setShowAddSolution(false);
  };

  const handleDeleteSolution = async (solId) => {
    if(confirm('Delete this solution?')) {
      await deleteItem(user, 'solutions', solId);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 transition-all duration-300">
      <div 
        onClick={() => setExpanded(!expanded)}
        className="p-5 cursor-pointer hover:bg-gray-50 flex justify-between items-start"
      >
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            {question.title}
          </h3>
          <p className="text-gray-600 line-clamp-2">{question.problemText}</p>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {solutions.length} Solutions
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-gray-300 hover:text-red-500 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {expanded ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 bg-gray-50/50">
          <div className="py-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Problem Description</h4>
            <p className="text-gray-800 whitespace-pre-wrap">{question.problemText}</p>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-gray-700">Solutions</h4>
              <Button 
                onClick={() => setShowAddSolution(true)} 
                variant="secondary" 
                className="text-xs py-1.5 px-3"
                icon={Plus}
              >
                Add Solution
              </Button>
            </div>

            {showAddSolution && (
              <div className="bg-white p-4 rounded-lg border border-indigo-100 mb-4 shadow-sm animate-fade-in-down">
                <div className="flex gap-4 mb-3">
                  <button 
                    onClick={() => setNewSolutionType('text')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${newSolutionType === 'text' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" /> Text Explanation
                  </button>
                  <button 
                    onClick={() => setNewSolutionType('code')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${newSolutionType === 'code' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <Code className="w-4 h-4 inline mr-2" /> Code Snippet
                  </button>
                </div>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px] font-mono text-sm"
                  placeholder={newSolutionType === 'code' ? "// Paste your solution code here..." : "Explain the approach..."}
                  value={newSolutionContent}
                  onChange={(e) => setNewSolutionContent(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-3">
                  <Button variant="ghost" onClick={() => setShowAddSolution(false)}>Cancel</Button>
                  <Button onClick={handleAddSolution}>Save Solution</Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {solutions.length === 0 ? (
                <div className="text-center py-8 text-gray-400 italic bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  No solutions yet. Be the first to solve it!
                </div>
              ) : (
                solutions.map(sol => (
                  <SolutionItem 
                    key={sol.id} 
                    solution={sol} 
                    onDelete={() => handleDeleteSolution(sol.id)} 
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===================================================================
  SECTION 5: MAIN APP ORCHESTRATION
  ===================================================================
*/

export default function App() {
  const user = useAuth();
  const [activeCourse, setActiveCourse] = useState('dsa');
  const [activeTopic, setActiveTopic] = useState(null);
  
  // Modals state
  const [isTopicModalOpen, setTopicModalOpen] = useState(false);
  const [isQuestionModalOpen, setQuestionModalOpen] = useState(false);
  
  // Form state
  const [newTopicName, setNewTopicName] = useState('');
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');

  // Data fetching
  const { data: topics, loading: topicsLoading } = useDataCollection(user, 'topics', 'course', activeCourse);
  const { data: questions, loading: questionsLoading } = useDataCollection(user, 'questions', 'topicId', activeTopic?.id);

  // Handlers
  const handleAddTopic = async () => {
    if (!newTopicName.trim()) return;
    await addItem(user, 'topics', {
      name: newTopicName,
      course: activeCourse
    });
    setNewTopicName('');
    setTopicModalOpen(false);
  };

  const handleAddQuestion = async () => {
    if (!newQuestionTitle.trim() || !newQuestionText.trim()) return;
    await addItem(user, 'questions', {
      topicId: activeTopic.id,
      title: newQuestionTitle,
      problemText: newQuestionText,
      course: activeCourse
    });
    setNewQuestionTitle('');
    setNewQuestionText('');
    setQuestionModalOpen(false);
  };

  const handleDeleteTopic = async (topicId, e) => {
    e.stopPropagation();
    if(confirm('Delete this topic and all its contents?')) {
      await deleteItem(user, 'topics', topicId);
      if (activeTopic?.id === topicId) setActiveTopic(null);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if(confirm('Delete this question?')) {
      await deleteItem(user, 'questions', qId);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      {/* Sidebar - Course Selection */}
      <div className="w-20 md:w-64 bg-indigo-900 text-white flex flex-col shadow-xl z-20 transition-all duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-indigo-800">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold hidden md:block tracking-tight">DevStudy</h1>
        </div>
        
        <div className="flex-1 py-6 space-y-2 px-3">
          <button
            onClick={() => { setActiveCourse('dsa'); setActiveTopic(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeCourse === 'dsa' ? 'bg-indigo-600 shadow-lg translate-x-1' : 'hover:bg-indigo-800 text-indigo-200'}`}
          >
            <Terminal className="w-5 h-5" />
            <span className="font-medium hidden md:block">DSA</span>
          </button>
          
          <button
            onClick={() => { setActiveCourse('db'); setActiveTopic(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeCourse === 'db' ? 'bg-indigo-600 shadow-lg translate-x-1' : 'hover:bg-indigo-800 text-indigo-200'}`}
          >
            <Database className="w-5 h-5" />
            <span className="font-medium hidden md:block">Databases</span>
          </button>
        </div>

        <div className="p-4 border-t border-indigo-800 text-xs text-indigo-400 text-center md:text-left">
          <span className="hidden md:inline">Logged in as </span>
          <span className="font-mono text-indigo-200">{user?.uid?.substring(0,6)}...</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        
        {/* Topics Column */}
        <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full z-10">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              {activeCourse === 'dsa' ? 'Algorithms' : 'DB Topics'}
            </h2>
            <button 
              onClick={() => setTopicModalOpen(true)}
              className="bg-indigo-100 p-2 rounded-lg text-indigo-600 hover:bg-indigo-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {topicsLoading ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
            ) : topics.length === 0 ? (
              <div className="text-center py-10 px-4 text-gray-400 text-sm">
                No topics found. <br/> Click + to start learning.
              </div>
            ) : (
              topics.map(topic => (
                <div 
                  key={topic.id}
                  onClick={() => setActiveTopic(topic)}
                  className={`group p-4 rounded-xl cursor-pointer transition-all border ${
                    activeTopic?.id === topic.id 
                      ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                      : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${activeTopic?.id === topic.id ? 'text-indigo-900' : 'text-gray-700'}`}>
                      {topic.name}
                    </span>
                    <button 
                      onClick={(e) => handleDeleteTopic(topic.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Content/Questions Area */}
        <div className="flex-1 flex flex-col bg-gray-50/50 h-full overflow-hidden">
          {activeTopic ? (
            <>
              <div className="p-6 md:p-8 border-b border-gray-200 bg-white shadow-sm flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-400 font-medium uppercase tracking-wide mb-1">
                    {activeCourse.toUpperCase()} &bull; TOPIC
                  </div>
                  <h2 className="text-3xl font-extrabold text-gray-900">{activeTopic.name}</h2>
                </div>
                <Button onClick={() => setQuestionModalOpen(true)} icon={Plus}>
                  New Problem
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {questionsLoading ? (
                   <div className="flex items-center gap-3 text-gray-400">
                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div> Loading problems...
                   </div>
                ) : questions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="bg-indigo-50 p-6 rounded-full mb-4">
                      <Code className="w-10 h-10 text-indigo-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No problems here yet</h3>
                    <p className="text-gray-500 max-w-sm">Add a problem statement to start collecting solutions and code snippets.</p>
                  </div>
                ) : (
                  questions.map(q => (
                    <QuestionCard key={q.id} user={user} question={q} onDelete={() => handleDeleteQuestion(q.id)} />
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-xl font-medium text-gray-500">Select a topic to view problems</p>
              <p className="text-sm mt-2 text-gray-400">Or create a new topic from the left sidebar</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={isTopicModalOpen} 
        onClose={() => setTopicModalOpen(false)} 
        title={`Add ${activeCourse.toUpperCase()} Topic`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic Name</label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Linked Lists, Normalization"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleAddTopic}>Create Topic</Button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isQuestionModalOpen} 
        onClose={() => setQuestionModalOpen(false)} 
        title="Add New Problem"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Reverse a Linked List"
              value={newQuestionTitle}
              onChange={(e) => setNewQuestionTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Problem Description</label>
            <textarea 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32"
              placeholder="Describe the problem details..."
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleAddQuestion}>Add Problem</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}