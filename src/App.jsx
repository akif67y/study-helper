import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
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
  doc,
  getDoc
} from 'firebase/firestore';
import {
  BookOpen,
  Plus,
  Code,
  FileText,
  ChevronRight,
  ChevronDown,
  Trash2,
  Layout,
  MessageSquare,
  ArrowLeft,
  LogOut,
  Sparkles,
  GraduationCap,
  Braces,
  Cpu,
  Globe,
  Palette
} from 'lucide-react';

/* ===================================================================
  SECTION 1: FIREBASE CONFIGURATION
  ===================================================================
*/

const firebaseConfig = {
  apiKey: "AIzaSyCEnCc-nI4FVLHxkb__nzXTWSGJ0xzTTtM",
  authDomain: "studyhelper-1.firebaseapp.com",
  projectId: "studyhelper-1",
  storageBucket: "studyhelper-1.firebasestorage.app",
  messagingSenderId: "137163148790",
  appId: "1:137163148790:web:d3ef16e955a3ad854acbd7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'devstudy-local';

// Course gradient presets
const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #00e054 0%, #40bcf4 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
  'linear-gradient(135deg, #5f27cd 0%, #341f97 100%)',
];

const ICONS = [
  { name: 'Code', icon: Braces },
  { name: 'CPU', icon: Cpu },
  { name: 'Globe', icon: Globe },
  { name: 'Palette', icon: Palette },
  { name: 'Book', icon: BookOpen },
  { name: 'Graduation', icon: GraduationCap },
  { name: 'Sparkles', icon: Sparkles },
];

/* ===================================================================
  SECTION 2: AUTH & DATA HOOKS
  ===================================================================
*/

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  return { user, loading, login, signup, logout };
};

const useDataCollection = (user, collectionName, parentField, parentId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !parentId) {
      if (!parentId) setData([]);
      setLoading(false);
      return;
    }

    const colRef = collection(db, 'artifacts', appId, 'users', user.uid, collectionName);
    const q = query(colRef, where(parentField, '==', parentId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
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

const useAllDocs = (user, collectionName) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const colRef = collection(db, 'artifacts', appId, 'users', user.uid, collectionName);

    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setData(items);
      setLoading(false);
    }, (error) => {
      console.error(`Error fetching ${collectionName}:`, error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, collectionName]);

  return { data, loading };
};

const useSingleDoc = (user, collectionName, docId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !docId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, collectionName, docId);
    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        setData({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    }).catch((error) => {
      console.error(`Error fetching ${collectionName}/${docId}:`, error);
      setLoading(false);
    });
  }, [user, collectionName, docId]);

  return { data, loading };
};

const addItem = async (user, collectionName, data) => {
  if (!user) return;
  const colRef = collection(db, 'artifacts', appId, 'users', user.uid, collectionName);
  return await addDoc(colRef, { ...data, userId: user.uid, timestamp: serverTimestamp() });
};

const deleteItem = async (user, collectionName, itemId) => {
  if (!user) return;
  const docRef = doc(db, 'artifacts', appId, 'users', user.uid, collectionName, itemId);
  await deleteDoc(docRef);
};

/* ===================================================================
  SECTION 3: UI COMPONENTS
  ===================================================================
*/

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled }) => {
  const base = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#14181c]";
  const variants = {
    primary: "bg-[#00e054] text-[#14181c] hover:bg-[#00c74a] focus-visible:ring-[#00e054] shadow-lg hover:shadow-[0_0_20px_rgba(0,224,84,0.3)]",
    secondary: "bg-[#2c3440] text-white border border-[#456] hover:bg-[#384250] hover:border-[#567] focus-visible:ring-[#456]",
    ghost: "bg-transparent text-[#99aabb] hover:bg-[#2c3440] hover:text-white",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-[#1c2228] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[#2c3440] animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#2c3440] flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-[#678] hover:text-white transition-colors p-1">
            <Plus className="w-5 h-5 transform rotate-45" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const NavBar = ({ user, logout }) => (
  <nav className="bg-[#14181c]/95 backdrop-blur-md border-b border-[#2c3440] sticky top-0 z-40">
    <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="bg-gradient-to-br from-[#00e054] to-[#40bcf4] p-2.5 rounded-xl shadow-lg group-hover:shadow-[0_0_20px_rgba(0,224,84,0.3)] transition-shadow">
          <Layout className="w-5 h-5 text-[#14181c]" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">DevStudy</span>
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-[#678] hidden sm:block">
          {user?.email?.split('@')[0]}
        </span>
        <button
          onClick={logout}
          className="p-2.5 rounded-lg text-[#678] hover:text-white hover:bg-[#2c3440] transition-all"
          data-tooltip="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  </nav>
);

const PageHeader = ({ title, subtitle, backLink, backText, rightContent }) => (
  <div className="border-b border-[#2c3440] bg-[#1c2228]/50">
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex justify-between items-start">
        <div>
          {backLink && (
            <Link to={backLink} className="inline-flex items-center text-sm text-[#00e054] hover:text-[#40bcf4] mb-3 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              {backText || 'Back'}
            </Link>
          )}
          {subtitle && <div className="text-xs text-[#678] font-semibold uppercase tracking-wider mb-2">{subtitle}</div>}
          <h1 className="text-3xl font-bold text-white">{title}</h1>
        </div>
        {rightContent}
      </div>
    </div>
  </div>
);

const CodeBlock = ({ code }) => (
  <div className="code-block my-4">
    <div className="code-block-header">
      <div className="code-block-dots">
        <div className="code-block-dot bg-red-500" />
        <div className="code-block-dot bg-yellow-500" />
        <div className="code-block-dot bg-green-500" />
      </div>
      <span className="text-xs text-[#678] font-mono ml-2">solution.js</span>
    </div>
    <pre><code>{code}</code></pre>
  </div>
);

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="text-center py-16 animate-fade-in-up">
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#2c3440] mb-6">
      <Icon className="w-10 h-10 text-[#456]" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-[#678] mb-6 max-w-sm mx-auto">{description}</p>
    {action}
  </div>
);

const Loader = () => (
  <div className="flex justify-center py-16">
    <div className="w-10 h-10 border-2 border-[#2c3440] border-t-[#00e054] rounded-full animate-spin" />
  </div>
);

/* ===================================================================
  SECTION 4: FEATURE COMPONENTS
  ===================================================================
*/

const SolutionItem = ({ solution, onDelete }) => (
  <div className="bg-[#242c34] rounded-xl p-4 mb-3 border border-[#2c3440] hover:border-[#456] transition-colors group relative">
    <button
      onClick={onDelete}
      className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-[#678] hover:text-red-400 hover:bg-red-500/10 transition-all"
    >
      <Trash2 className="w-4 h-4" />
    </button>

    <div className="flex items-center gap-2 mb-3">
      <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${solution.type === 'code'
          ? 'bg-purple-500/20 text-purple-400'
          : 'bg-blue-500/20 text-blue-400'
        }`}>
        {solution.type}
      </span>
      <span className="text-xs text-[#456]">
        {solution.timestamp?.seconds ? new Date(solution.timestamp.seconds * 1000).toLocaleDateString() : 'Just now'}
      </span>
    </div>

    {solution.type === 'code' ? (
      <CodeBlock code={solution.content} />
    ) : (
      <p className="text-[#99aabb] whitespace-pre-wrap leading-relaxed">{solution.content}</p>
    )}
  </div>
);

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
    if (confirm('Delete this solution?')) {
      await deleteItem(user, 'solutions', solId);
    }
  };

  return (
    <div className="bg-[#1c2228] rounded-2xl border border-[#2c3440] overflow-hidden mb-4 hover:border-[#456] transition-colors">
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-5 cursor-pointer flex justify-between items-start"
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-1.5 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#00e054] flex-shrink-0" />
            <span className="truncate">{question.title}</span>
          </h3>
          <p className="text-[#678] text-sm line-clamp-2">{question.problemText}</p>
        </div>
        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          <span className="text-xs font-medium text-[#456] bg-[#2c3440] px-2.5 py-1 rounded-full">
            {solutions.length} {solutions.length === 1 ? 'solution' : 'solutions'}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-lg text-[#456] hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {expanded ? <ChevronDown className="w-5 h-5 text-[#456]" /> : <ChevronRight className="w-5 h-5 text-[#456]" />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-[#2c3440] bg-[#14181c]/50 animate-fade-in">
          <div className="py-4">
            <h4 className="text-xs font-bold text-[#456] uppercase tracking-wider mb-2">Problem Description</h4>
            <p className="text-[#99aabb] whitespace-pre-wrap">{question.problemText}</p>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-semibold text-white">Solutions</h4>
              <Button onClick={() => setShowAddSolution(true)} variant="secondary" icon={Plus} className="text-xs py-1.5 px-3">
                Add Solution
              </Button>
            </div>

            {showAddSolution && (
              <div className="bg-[#242c34] p-4 rounded-xl border border-[#2c3440] mb-4 animate-fade-in-down">
                <div className="flex gap-3 mb-3">
                  <button
                    onClick={() => setNewSolutionType('text')}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${newSolutionType === 'text'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'text-[#678] hover:bg-[#2c3440]'
                      }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" /> Text
                  </button>
                  <button
                    onClick={() => setNewSolutionType('code')}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${newSolutionType === 'code'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'text-[#678] hover:bg-[#2c3440]'
                      }`}
                  >
                    <Code className="w-4 h-4 inline mr-2" /> Code
                  </button>
                </div>
                <textarea
                  className="input min-h-[120px] font-mono text-sm"
                  placeholder={newSolutionType === 'code' ? "// Your code here..." : "Explain your approach..."}
                  value={newSolutionContent}
                  onChange={(e) => setNewSolutionContent(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-3">
                  <Button variant="ghost" onClick={() => setShowAddSolution(false)}>Cancel</Button>
                  <Button onClick={handleAddSolution}>Save</Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {solutions.length === 0 ? (
                <div className="text-center py-8 text-[#456] italic bg-[#242c34] rounded-xl border border-dashed border-[#2c3440]">
                  No solutions yet. Be the first!
                </div>
              ) : (
                solutions.map(sol => (
                  <SolutionItem key={sol.id} solution={sol} onDelete={() => handleDeleteSolution(sol.id)} />
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
  SECTION 5: AUTH PAGE
  ===================================================================
*/

const AuthPage = ({ login, signup }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) await login(email, password);
      else await signup(email, password);
    } catch (err) {
      setError(err.message.replace('Firebase:', '').replace(/\(auth\/[^)]+\)/g, '').trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-[#00e054] to-[#40bcf4] p-4 rounded-2xl shadow-lg shadow-[#00e054]/20">
            <Layout className="w-10 h-10 text-[#14181c]" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold text-white mb-2">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-center text-[#678]">
          Your personal study companion
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#1c2228] py-8 px-6 shadow-2xl rounded-2xl border border-[#2c3440]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-[#99aabb] mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#99aabb] mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Sign up')}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2c3440]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-[#1c2228] text-[#456]">
                  {isLogin ? 'New here?' : 'Have an account?'}
                </span>
              </div>
            </div>
            <Button
              variant="secondary"
              className="w-full mt-4"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Create account' : 'Sign in'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===================================================================
  SECTION 6: PAGES
  ===================================================================
*/

const MainMenuPage = ({ user, logout }) => {
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState(0);

  const { data: courses, loading: coursesLoading } = useAllDocs(user, 'courses');

  const handleAddCourse = async () => {
    if (!newCourseName.trim()) return;
    const docRef = await addItem(user, 'courses', {
      name: newCourseName,
      gradient: GRADIENTS[selectedGradient],
      icon: ICONS[selectedIcon].name
    });
    setNewCourseName('');
    setModalOpen(false);
    if (docRef) navigate(`/course/${docRef.id}`);
  };

  const handleDeleteCourse = async (courseId, e) => {
    e.stopPropagation();
    if (confirm('Delete this course and all its contents?')) {
      await deleteItem(user, 'courses', courseId);
    }
  };

  const getIconComponent = (iconName) => {
    const found = ICONS.find(i => i.name === iconName);
    return found ? found.icon : BookOpen;
  };

  return (
    <div className="min-h-screen">
      <NavBar user={user} logout={logout} />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-white mb-3">
            Welcome back, <span className="gradient-text">{user?.email?.split('@')[0]}</span>
          </h1>
          <p className="text-lg text-[#678]">What would you like to study today?</p>
        </div>

        {coursesLoading ? (
          <Loader />
        ) : courses.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No courses yet"
            description="Create your first course to start organizing your study materials and track your progress."
            action={<Button onClick={() => setModalOpen(true)} icon={Plus}>Create Course</Button>}
          />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {courses.map(course => {
                const IconComponent = getIconComponent(course.icon);
                return (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="group bg-[#1c2228] rounded-2xl border border-[#2c3440] overflow-hidden cursor-pointer card-hover hover:border-[#456]"
                  >
                    <div
                      className="h-28 flex items-center justify-center relative overflow-hidden"
                      style={{ background: course.gradient }}
                    >
                      <IconComponent className="w-12 h-12 text-white/90 group-hover:scale-110 transition-transform duration-300" />
                      <button
                        onClick={(e) => handleDeleteCourse(course.id, e)}
                        className="absolute top-3 right-3 p-2 rounded-lg bg-black/30 text-white/70 hover:text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-5">
                      <h2 className="text-lg font-semibold text-white mb-1 group-hover:text-[#00e054] transition-colors">
                        {course.name}
                      </h2>
                      <div className="flex items-center text-sm text-[#456] group-hover:text-[#678] transition-colors">
                        <span>View topics</span>
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add Course Card */}
              <button
                onClick={() => setModalOpen(true)}
                className="group bg-[#1c2228] rounded-2xl border-2 border-dashed border-[#2c3440] hover:border-[#00e054] p-8 flex flex-col items-center justify-center gap-4 transition-all hover:bg-[#242c34] min-h-[180px]"
              >
                <div className="w-14 h-14 rounded-full bg-[#2c3440] flex items-center justify-center group-hover:bg-[#00e054]/20 transition-colors">
                  <Plus className="w-6 h-6 text-[#456] group-hover:text-[#00e054] transition-colors" />
                </div>
                <span className="text-[#678] group-hover:text-[#00e054] font-medium transition-colors">Add Course</span>
              </button>
            </div>
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Create New Course">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#99aabb] mb-1.5">Course Name</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., Data Structures, Web Development"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#99aabb] mb-2">Color Theme</label>
            <div className="flex flex-wrap gap-2">
              {GRADIENTS.map((gradient, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedGradient(i)}
                  className={`w-10 h-10 rounded-xl transition-all ${selectedGradient === i ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1c2228] scale-110' : 'hover:scale-105'
                    }`}
                  style={{ background: gradient }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#99aabb] mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedIcon(i)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedIcon === i
                        ? 'bg-[#00e054] text-[#14181c]'
                        : 'bg-[#2c3440] text-[#678] hover:text-white hover:bg-[#384250]'
                      }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={handleAddCourse} className="w-full">Create Course</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const CoursePage = ({ user, logout }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  const { data: course, loading: courseLoading } = useSingleDoc(user, 'courses', courseId);
  const { data: topics, loading: topicsLoading } = useDataCollection(user, 'topics', 'course', courseId);

  const handleAddTopic = async () => {
    if (!newTopicName.trim()) return;
    await addItem(user, 'topics', { name: newTopicName, course: courseId });
    setNewTopicName('');
    setModalOpen(false);
  };

  const handleDeleteTopic = async (topicId, e) => {
    e.stopPropagation();
    if (confirm('Delete this topic and all its contents?')) {
      await deleteItem(user, 'topics', topicId);
    }
  };

  if (courseLoading) {
    return (
      <div className="min-h-screen">
        <NavBar user={user} logout={logout} />
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar user={user} logout={logout} />

      {/* Hero Header */}
      <div
        className="relative h-48 flex items-end"
        style={{ background: course?.gradient || GRADIENTS[0] }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#14181c] to-transparent" />
        <div className="relative max-w-5xl mx-auto px-6 pb-6 w-full">
          <Link to="/" className="inline-flex items-center text-sm text-white/80 hover:text-white mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            All Courses
          </Link>
          <h1 className="text-4xl font-bold text-white">{course?.name || 'Course'}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Topics</h2>
          <Button onClick={() => setModalOpen(true)} icon={Plus}>New Topic</Button>
        </div>

        {topicsLoading ? (
          <Loader />
        ) : topics.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No topics yet"
            description="Create your first topic to start organizing your study materials."
            action={<Button onClick={() => setModalOpen(true)} icon={Plus}>Create Topic</Button>}
          />
        ) : (
          <div className="grid gap-3 stagger-children">
            {topics.map(topic => (
              <div
                key={topic.id}
                onClick={() => navigate(`/course/${courseId}/topic/${topic.id}`)}
                className="group bg-[#1c2228] rounded-xl border border-[#2c3440] p-5 hover:border-[#456] transition-all cursor-pointer card-hover"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#2c3440] flex items-center justify-center group-hover:bg-[#00e054]/20 transition-colors">
                      <BookOpen className="w-5 h-5 text-[#456] group-hover:text-[#00e054] transition-colors" />
                    </div>
                    <span className="font-medium text-white">{topic.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeleteTopic(topic.id, e)}
                      className="p-2 rounded-lg opacity-0 group-hover:opacity-100 text-[#456] hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-[#456] group-hover:text-[#00e054] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Add New Topic">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#99aabb] mb-1.5">Topic Name</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., Linked Lists, SQL Joins"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              autoFocus
            />
          </div>
          <Button onClick={handleAddTopic} className="w-full">Create Topic</Button>
        </div>
      </Modal>
    </div>
  );
};

const TopicPage = ({ user, logout }) => {
  const { courseId, topicId } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');

  const { data: course } = useSingleDoc(user, 'courses', courseId);
  const { data: topic, loading: topicLoading } = useSingleDoc(user, 'topics', topicId);
  const { data: questions, loading: questionsLoading } = useDataCollection(user, 'questions', 'topicId', topicId);

  const handleAddQuestion = async () => {
    if (!newQuestionTitle.trim() || !newQuestionText.trim()) return;
    await addItem(user, 'questions', {
      topicId: topicId,
      title: newQuestionTitle,
      problemText: newQuestionText,
      course: courseId
    });
    setNewQuestionTitle('');
    setNewQuestionText('');
    setModalOpen(false);
  };

  const handleDeleteQuestion = async (qId) => {
    if (confirm('Delete this question?')) {
      await deleteItem(user, 'questions', qId);
    }
  };

  if (topicLoading) {
    return (
      <div className="min-h-screen">
        <NavBar user={user} logout={logout} />
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar user={user} logout={logout} />

      <PageHeader
        title={topic?.name || 'Topic'}
        subtitle={course?.name}
        backLink={`/course/${courseId}`}
        backText="Back to Topics"
        rightContent={<Button onClick={() => setModalOpen(true)} icon={Plus}>New Problem</Button>}
      />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {questionsLoading ? (
          <Loader />
        ) : questions.length === 0 ? (
          <EmptyState
            icon={Code}
            title="No problems yet"
            description="Add your first problem to start collecting solutions and building your knowledge base."
            action={<Button onClick={() => setModalOpen(true)} icon={Plus}>Add Problem</Button>}
          />
        ) : (
          <div className="stagger-children">
            {questions.map(q => (
              <QuestionCard key={q.id} user={user} question={q} onDelete={() => handleDeleteQuestion(q.id)} />
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Add New Problem">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#99aabb] mb-1.5">Title</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., Reverse a Linked List"
              value={newQuestionTitle}
              onChange={(e) => setNewQuestionTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#99aabb] mb-1.5">Problem Description</label>
            <textarea
              className="input min-h-[120px]"
              placeholder="Describe the problem in detail..."
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
            />
          </div>
          <Button onClick={handleAddQuestion} className="w-full">Add Problem</Button>
        </div>
      </Modal>
    </div>
  );
};

/* ===================================================================
  SECTION 7: APP ROUTER
  ===================================================================
*/

export default function App() {
  const { user, loading, login, signup, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#2c3440] border-t-[#00e054] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage login={login} signup={signup} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenuPage user={user} logout={logout} />} />
        <Route path="/course/:courseId" element={<CoursePage user={user} logout={logout} />} />
        <Route path="/course/:courseId/topic/:topicId" element={<TopicPage user={user} logout={logout} />} />
      </Routes>
    </BrowserRouter>
  );
}