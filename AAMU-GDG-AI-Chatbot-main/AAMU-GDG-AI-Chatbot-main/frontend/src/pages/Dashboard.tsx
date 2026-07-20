import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, ArrowUpRight, Award, BarChart3, BookOpen, Clock3, FileCheck2, GraduationCap, LockKeyhole, Upload } from 'lucide-react';
import { pdfParserService } from '../services/pdfParser';

interface CourseProgress {
  courseName: string;
  progress: number;
  grade?: string;
}

interface DashboardStats {
  totalCredits: number;
  gpa: number;
  completedCourses: number;
  ongoingCourses: number;
  major: string;
  studentName: string;
  studentId: string;
}

const Dashboard = () => {
  const reduceMotion = useReducedMotion();
  const [stats, setStats] = useState<DashboardStats>({ totalCredits: 0, gpa: 0, completedCourses: 0, ongoingCourses: 0, major: '', studentName: '', studentId: '' });
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    setError(null);
    try {
      const parsedData = await pdfParserService.uploadAndParsePdf(file);
      setStats({
        totalCredits: parsedData.totalCredits,
        gpa: parsedData.gpa,
        completedCourses: parsedData.completedCourses.length,
        ongoingCourses: parsedData.ongoingCourses.length,
        major: parsedData.major,
        studentName: parsedData.studentName,
        studentId: parsedData.studentId,
      });
      setCourseProgress([
        ...parsedData.completedCourses.map(course => {
          const [courseCode, grade] = course.split(' (');
          return { courseName: courseCode, progress: 100, grade: grade ? grade.replace(')', '') : 'Completed' };
        }),
        ...parsedData.ongoingCourses.map(course => ({ courseName: course, progress: 50 })),
      ]);
    } catch (uploadError: unknown) {
      setError(uploadError instanceof Error ? uploadError.message : 'The PDF could not be processed locally.');
    } finally {
      setUploadingPdf(false);
      event.target.value = '';
    }
  };

  const statCards = [
    { icon: GraduationCap, label: 'Credits earned', value: stats.totalCredits, note: 'Degree progress' },
    { icon: Award, label: 'Current GPA', value: stats.gpa.toFixed(2), note: 'Cumulative' },
    { icon: BookOpen, label: 'Completed', value: stats.completedCourses, note: 'Courses' },
    { icon: Clock3, label: 'In progress', value: stats.ongoingCourses, note: 'This term' },
  ];

  return (
    <div className="campus-grid min-h-[calc(100vh-4rem)]">
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 sm:pt-16">
        <motion.header
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-7 border-b ink-border pb-9 lg:grid-cols-[1fr_auto] lg:items-end"
        >
          <div>
            <p className="route-kicker">DegreeWorks · Local workspace</p>
            <h1 className="mt-6 font-display text-[clamp(3.5rem,7vw,6.6rem)] leading-[0.86] tracking-[-0.05em] text-slate-950 dark:text-white">Read your<br /><span className="italic text-primary-800 dark:text-secondary-300">academic path.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">Import a DegreeWorks PDF to turn the audit into a clear, private progress view.</p>
          </div>
          <div className="flex max-w-sm items-start gap-3 border-l-2 border-secondary-300 pl-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <LockKeyhole size={18} className="mt-1 shrink-0 text-primary-700 dark:text-secondary-300" />
            <p>Parsing happens in this browser. Your academic record is not uploaded to a server.</p>
          </div>
        </motion.header>

        {stats.studentName && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 grid gap-px overflow-hidden border border-black/10 bg-black/10 dark:border-white/10 dark:bg-white/10 sm:grid-cols-3">
            {[
              ['Student', stats.studentName],
              ['Major', stats.major || 'Not found'],
              ['Student ID', stats.studentId || 'Not found'],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#f8f5ee] p-4 dark:bg-[#0d1828]">
                <p className="field-label">{label}</p>
                <p className="mt-2 font-display text-2xl text-slate-900 dark:text-white">{value}</p>
              </div>
            ))}
          </motion.section>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <motion.aside
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 }}
            className="field-panel flex min-h-[430px] flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between border-b ink-border px-5 py-4">
              <span className="field-label">Input document</span>
              <span className="font-utility text-[0.6rem] font-bold uppercase tracking-[0.16em] text-slate-400">PDF · max 10 MB</span>
            </div>
            <div className="relative flex flex-1 flex-col justify-between overflow-hidden bg-primary-600 p-6 text-white sm:p-8">
              <div className="absolute -right-8 top-16 h-36 w-36 rounded-full border-[28px] border-white/10" aria-hidden="true" />
              <div className="relative z-10">
                <span className="grid h-12 w-12 place-items-center border border-white/30 bg-white/10"><Upload size={21} /></span>
                <h2 className="mt-8 max-w-sm font-display text-4xl leading-[0.94]">Drop in the audit.<br /><span className="italic">Keep it local.</span></h2>
                <p className="mt-5 max-w-sm leading-7 text-white/80">The reader extracts totals, courses, GPA, and student details into the panels beside it.</p>
              </div>
              <div className="relative z-10 mt-10">
                <input id="pdf-upload" type="file" accept=".pdf" onChange={handlePdfUpload} className="sr-only" disabled={uploadingPdf} />
                <label
                  htmlFor="pdf-upload"
                  aria-disabled={uploadingPdf}
                  className={`group flex min-h-14 items-center justify-between bg-white px-5 font-bold text-primary-800 transition ${uploadingPdf ? 'cursor-wait opacity-70' : 'cursor-pointer hover:-translate-y-1'}`}
                >
                  {uploadingPdf ? 'Reading DegreeWorks…' : 'Choose DegreeWorks PDF'}
                  <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </label>
              </div>
            </div>
          </motion.aside>

          <div className="grid content-start gap-6">
            <div className="grid gap-px overflow-hidden border border-black/10 bg-black/10 dark:border-white/10 dark:bg-white/10 sm:grid-cols-2">
              {statCards.map((stat, index) => (
                <motion.article
                  key={stat.label}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + index * 0.06 }}
                  className="group bg-[#faf8f2] p-5 dark:bg-[#0e1929] sm:p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="field-label">{stat.label}</p>
                      <p className="mt-5 font-display text-5xl tracking-[-0.04em] text-slate-950 dark:text-white">{stat.value}</p>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{stat.note}</p>
                    </div>
                    <stat.icon size={20} className="text-slate-400 transition-transform group-hover:-rotate-6 group-hover:text-primary-700 dark:group-hover:text-secondary-300" />
                  </div>
                </motion.article>
              ))}
            </div>

            <section className="field-panel p-5 sm:p-6" aria-labelledby="course-progress-heading">
              <div className="flex items-center justify-between border-b ink-border pb-4">
                <div>
                  <p className="field-label">Course ledger</p>
                  <h2 id="course-progress-heading" className="mt-2 font-display text-3xl text-slate-900 dark:text-white">Progress by course</h2>
                </div>
                <BarChart3 size={22} className="text-primary-700 dark:text-secondary-300" />
              </div>

              {courseProgress.length > 0 ? (
                <div className="mt-5 divide-y ink-border">
                  {courseProgress.map((course, index) => (
                    <motion.div key={`${course.courseName}-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} className="grid gap-3 py-4 sm:grid-cols-[1fr_2fr_auto] sm:items-center">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{course.courseName}</span>
                      <div className="h-1.5 overflow-hidden bg-black/10 dark:bg-white/10" aria-label={`${course.progress}% complete`}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${course.progress}%` }} className="h-full bg-primary-600 dark:bg-secondary-300" />
                      </div>
                      <span className="font-utility text-[0.62rem] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{course.grade || 'In progress'}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid min-h-44 place-items-center py-8 text-center">
                  <div>
                    <FileCheck2 className="mx-auto text-primary-700 dark:text-secondary-300" size={26} />
                    <p className="mt-4 font-display text-2xl text-slate-800 dark:text-white">Your course map will appear here.</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Choose a DegreeWorks PDF to begin.</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} role="alert" className="mt-6 flex items-start gap-3 border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="mt-0.5 shrink-0" size={18} /><p className="text-sm">{error}</p>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
