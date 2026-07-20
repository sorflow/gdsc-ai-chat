import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, Book, Calendar, CheckCircle2, Edit2, FileText, GraduationCap, Plus, Save, ShieldCheck, X } from 'lucide-react';
import { profileApi, type UserProfile } from '../profileApi';
import { validatePdfFile } from '../services/pdfParser';

const Profile = () => {
  const reduceMotion = useReducedMotion();
  const [profile, setProfile] = useState<UserProfile>({ firstName: '', lastName: '', classification: '', coursesTaken: [], major: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [newCourse, setNewCourse] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [pdfFileName, setPdfFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const savedProfile = await profileApi.getProfile();
        if (savedProfile && !cancelled) setProfile(savedProfile);
      } catch {
        if (!cancelled) setError('Failed to load profile. Please try again later.');
      }
    };
    void loadProfile();
    return () => { cancelled = true; };
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setProfile(previous => ({ ...previous, [name]: value }));
  };

  const handleAddCourse = () => {
    const course = newCourse.trim();
    if (course && !profile.coursesTaken.includes(course)) {
      setProfile(previous => ({ ...previous, coursesTaken: [...previous.coursesTaken, course] }));
      setNewCourse('');
    }
  };

  const handleRemoveCourse = (course: string) => {
    setProfile(previous => ({ ...previous, coursesTaken: previous.coursesTaken.filter(item => item !== course) }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await profileApi.saveProfile(profile);
      setIsEditing(false);
      setIsSaved(true);
      setError(null);
      window.setTimeout(() => setIsSaved(false), 3000);
    } catch {
      setError('Failed to save profile. Please try again later.');
    }
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await validatePdfFile(file);
      const uploadedFile = await profileApi.uploadDegreeWorks(file);
      setPdfFileName(uploadedFile.name);
      setProfile(previous => ({ ...previous, degreeWorksPdfName: uploadedFile.name }));
      setError(null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'The PDF could not be selected.');
    } finally {
      event.target.value = '';
    }
  };

  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Your name';

  return (
    <div className="campus-grid min-h-[calc(100vh-4rem)]">
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 sm:pt-16">
        <motion.header
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-7 border-b ink-border pb-9 md:grid-cols-[1fr_auto] md:items-end"
        >
          <div>
            <p className="route-kicker">Private student context</p>
            <h1 className="mt-6 font-display text-[clamp(3.6rem,7vw,6.6rem)] leading-[0.86] tracking-[-0.05em] text-slate-950 dark:text-white">Your academic<br /><span className="italic text-primary-800 dark:text-secondary-300">field notes.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">Keep the details that make advising answers more relevant. This profile stays in your browser.</p>
          </div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="group inline-flex min-h-13 items-center justify-between gap-8 bg-primary-800 py-3 pl-5 pr-3 text-sm font-bold text-white transition hover:-translate-y-1 dark:bg-secondary-300 dark:text-[#111827]">
              Edit profile<span className="grid h-9 w-9 place-items-center bg-white text-primary-800 dark:bg-[#111827] dark:text-secondary-300"><Edit2 size={16} className="transition-transform group-hover:-rotate-6" /></span>
            </button>
          )}
        </motion.header>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.form
              key="edit"
              onSubmit={handleSubmit}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]"
            >
              <section className="field-panel p-5 sm:p-7" aria-labelledby="personal-heading">
                <div className="flex items-center justify-between border-b ink-border pb-4">
                  <div><p className="field-label">Identity</p><h2 id="personal-heading" className="mt-2 font-display text-3xl text-slate-900 dark:text-white">Personal information</h2></div>
                  <GraduationCap className="text-primary-700 dark:text-secondary-300" size={22} />
                </div>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <label className="block"><span className="field-label">First name</span><input className="field-input mt-2" id="firstName" name="firstName" value={profile.firstName} onChange={handleInputChange} autoComplete="given-name" /></label>
                  <label className="block"><span className="field-label">Last name</span><input className="field-input mt-2" id="lastName" name="lastName" value={profile.lastName} onChange={handleInputChange} autoComplete="family-name" /></label>
                  <label className="block sm:col-span-2"><span className="field-label">Major</span><input className="field-input mt-2" name="major" value={profile.major} onChange={handleInputChange} placeholder="e.g. Computer Science" /></label>
                  <label className="block"><span className="field-label">Classification</span><select className="field-input mt-2" name="classification" value={profile.classification} onChange={handleInputChange}><option value="">Select classification</option><option>Freshman</option><option>Sophomore</option><option>Junior</option><option>Senior</option></select></label>
                  <label className="block"><span className="field-label">Expected graduation</span><input className="field-input mt-2" type="month" name="expectedGraduation" value={profile.expectedGraduation || ''} onChange={handleInputChange} /></label>
                </div>
              </section>

              <section className="field-panel p-5 sm:p-7" aria-labelledby="academic-heading">
                <div className="flex items-center justify-between border-b ink-border pb-4">
                  <div><p className="field-label">Advising context</p><h2 id="academic-heading" className="mt-2 font-display text-3xl text-slate-900 dark:text-white">Academic information</h2></div>
                  <Book className="text-primary-700 dark:text-secondary-300" size={22} />
                </div>
                <div className="mt-6">
                  <label htmlFor="course-input" className="field-label">Courses taken</label>
                  <div className="mt-2 flex gap-2">
                    <input id="course-input" className="field-input" value={newCourse} onChange={event => setNewCourse(event.target.value)} placeholder="Enter a course code" onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); handleAddCourse(); } }} />
                    <button type="button" onClick={handleAddCourse} className="grid w-13 shrink-0 place-items-center bg-secondary-300 text-[#111827] transition hover:bg-secondary-400" aria-label="Add course"><Plus size={19} /></button>
                  </div>
                  <div className="mt-3 flex min-h-28 flex-wrap content-start gap-2 border ink-border bg-white/45 p-3 dark:bg-[#07101d]/45">
                    {profile.coursesTaken.length ? profile.coursesTaken.map(course => (
                      <span key={course} className="inline-flex h-9 items-center gap-2 bg-primary-100 px-3 text-xs font-bold text-primary-900 dark:bg-primary-950 dark:text-primary-100">{course}<button type="button" onClick={() => handleRemoveCourse(course)} className="opacity-55 transition hover:opacity-100" aria-label={`Remove ${course}`}><X size={13} /></button></span>
                    )) : <span className="text-sm text-slate-400">No courses added yet.</span>}
                  </div>
                </div>

                <div className="mt-6 border-t ink-border pt-6">
                  <p className="field-label">DegreeWorks · Optional</p>
                  <input id="degreeWorks" type="file" accept=".pdf" onChange={handlePdfUpload} className="sr-only" />
                  <label htmlFor="degreeWorks" className="mt-2 flex min-h-12 cursor-pointer items-center justify-between border ink-border bg-white/65 px-4 text-sm font-semibold transition hover:border-primary-700 dark:bg-[#07101d]/65 dark:hover:border-secondary-300"><span className="flex items-center gap-2"><FileText size={17} /> Choose PDF</span><span className="max-w-[48%] truncate text-xs text-slate-500">{pdfFileName || profile.degreeWorksPdfName || 'No file selected'}</span></label>
                </div>

                <div className="mt-6 flex items-start gap-3 border-l-2 border-secondary-300 bg-secondary-50/60 p-4 text-sm leading-6 text-secondary-900 dark:bg-secondary-950/25 dark:text-secondary-200"><ShieldCheck className="mt-0.5 shrink-0" size={18} /><p>These details help tailor guidance and remain local to this browser.</p></div>
              </section>

              <div className="flex flex-wrap justify-end gap-3 lg:col-span-2">
                <button type="button" onClick={() => setIsEditing(false)} className="inline-flex min-h-12 items-center gap-2 border ink-border px-5 text-sm font-bold text-slate-700 transition hover:bg-black/5 dark:text-slate-200 dark:hover:bg-white/5"><X size={17} /> Cancel</button>
                <button type="submit" className="inline-flex min-h-12 items-center gap-2 bg-primary-800 px-6 text-sm font-bold text-white transition hover:-translate-y-1 dark:bg-secondary-300 dark:text-[#111827]"><Save size={17} /> Save changes</button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="view"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 grid gap-6 lg:grid-cols-[1.28fr_0.72fr]"
            >
              <div className="field-panel overflow-hidden">
                <div className="grid min-h-[420px] md:grid-cols-[0.42fr_0.58fr]">
                  <div className="relative flex flex-col justify-between overflow-hidden bg-primary-600 p-6 text-white sm:p-8">
                    <div className="absolute -right-10 top-16 h-40 w-40 rounded-full border-[32px] border-white/10" aria-hidden="true" />
                    <div className="relative z-10"><p className="font-utility text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/70">Student field card</p><div className="mt-10 grid h-24 w-24 place-items-center rounded-full border border-white/30 bg-white/10 font-display text-4xl italic">{profile.firstName?.[0] || 'A'}{profile.lastName?.[0] || 'M'}</div></div>
                    <div className="relative z-10"><p className="font-display text-4xl leading-none">{displayName}</p><p className="mt-3 font-utility text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/70">{profile.classification || 'Classification open'}</p></div>
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between border-b ink-border pb-4"><div><p className="field-label">Academic profile</p><h2 className="mt-2 font-display text-3xl text-slate-900 dark:text-white">At a glance</h2></div><GraduationCap size={22} className="text-primary-700 dark:text-secondary-300" /></div>
                    <dl className="mt-3 divide-y ink-border">
                      {[
                        ['Major', profile.major || 'Not specified'],
                        ['Classification', profile.classification || 'Not specified'],
                        ['Expected graduation', profile.expectedGraduation ? new Date(`${profile.expectedGraduation}-02`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Not specified'],
                        ['Courses recorded', String(profile.coursesTaken.length)],
                      ].map(([label, value]) => <div key={label} className="grid grid-cols-[0.8fr_1.2fr] gap-4 py-4"><dt className="field-label">{label}</dt><dd className="text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</dd></div>)}
                    </dl>
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                <section className="field-panel p-5 sm:p-6">
                  <div className="flex items-center justify-between"><div><p className="field-label">Course record</p><h2 className="mt-2 font-display text-3xl text-slate-900 dark:text-white">Courses taken</h2></div><Book size={21} className="text-primary-700 dark:text-secondary-300" /></div>
                  <div className="mt-6 flex flex-wrap gap-2">{profile.coursesTaken.length ? profile.coursesTaken.map(course => <span key={course} className="bg-primary-100 px-3 py-2 text-xs font-bold text-primary-900 dark:bg-primary-950 dark:text-primary-100">{course}</span>) : <p className="text-sm text-slate-500 dark:text-slate-400">No courses added yet.</p>}</div>
                </section>
                <section className="overflow-hidden border border-black/10 bg-[#111827] p-5 text-white dark:border-white/10 dark:bg-[#efe7db] dark:text-[#111827] sm:p-6">
                  <div className="flex items-center gap-2"><Calendar size={19} className="text-secondary-300 dark:text-primary-700" /><p className="font-utility text-[0.62rem] font-bold uppercase tracking-[0.18em] text-secondary-300 dark:text-primary-700">Document status</p></div>
                  <p className="mt-5 font-display text-3xl">{profile.degreeWorksPdfName ? 'Audit attached.' : 'No audit attached.'}</p>
                  <p className="mt-3 break-all text-sm leading-6 text-slate-300 dark:text-slate-600">{profile.degreeWorksPdfName || 'Edit the profile to add a DegreeWorks PDF.'}</p>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <AnimatePresence>
        {error && <motion.div role="alert" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-4 right-4 z-50 flex max-w-sm items-center gap-3 border border-red-300 bg-red-700 px-5 py-3 text-sm font-semibold text-white shadow-xl"><AlertCircle size={18} />{error}</motion.div>}
        {isSaved && <motion.div role="status" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-4 right-4 z-50 flex max-w-sm items-center gap-3 border border-emerald-300 bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-xl"><CheckCircle2 size={18} />Profile updated successfully.</motion.div>}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
