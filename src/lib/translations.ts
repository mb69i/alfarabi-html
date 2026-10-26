// ── Arabic & English Translation Dictionary ──────────────────────────
// All UI text for the Alfarabi University platform.

export type Locale = 'en' | 'ar';

const translations: Record<string, Record<Locale, string>> = {
  // ── Navbar ──
  'nav.home': { en: 'Home', ar: 'الرئيسية' },
  'nav.about': { en: 'About', ar: 'حول' },
  'nav.programs': { en: 'Programs', ar: 'البرامج' },
  'nav.classes': { en: 'Classes', ar: 'الصفوف' },
  'nav.calendar': { en: 'Calendar', ar: 'التقويم' },
  'nav.news': { en: 'News', ar: 'الأخبار' },
  'nav.portfolio': { en: 'Portfolio', ar: 'المعرض' },
  'nav.admin': { en: 'Admin', ar: 'الإدارة' },
  'nav.dashboard': { en: 'Dashboard', ar: 'لوحة التحكم' },
  'nav.signout': { en: 'Sign Out', ar: 'تسجيل الخروج' },

  // ── Hero Section ──
  'hero.badge_prefix': { en: 'AI Engineering Department', ar: 'قسم هندسة الذكاء الاصطناعي' },
  'hero.headline_top': { en: 'Shape the Future of', ar: 'اصنع مستقبل' },
  'hero.headline_accent': { en: 'Artificial Intelligence', ar: 'الذكاء الاصطناعي' },
  'hero.explore_programs': { en: 'Explore Programs', ar: 'استكشف البرامج' },
  'hero.our_story': { en: 'Our Story', ar: 'قصتنا' },
  'hero.years_excellence': { en: 'Years of Excellence', ar: 'سنوات من التميز' },
  'hero.active_students': { en: 'Active Students', ar: 'طالب نشط' },
  'hero.research_papers': { en: 'AI Research Papers', ar: 'أبحاث الذكاء الاصطناعي' },
  'hero.top_dept': { en: 'AI Dept. in Iraq', ar: 'قسم الذكاء الاصطناعي في العراق' },
  'hero.scroll_down': { en: 'Scroll down', ar: 'مرر للأسفل' },

  // ── Stats Section ──
  'stats.enrolled': { en: 'Enrolled Students', ar: 'الطلاب المسجلين' },
  'stats.enrolled_desc': { en: 'Across all AI & CS programs', ar: 'في جميع برامج الذكاء الاصطناعي وعلوم الحاسوب' },
  'stats.papers': { en: 'Research Papers', ar: 'أبحاث علمية' },
  'stats.papers_desc': { en: 'Published in top-tier journals', ar: 'منشورة في مجلات عالمية رائدة' },
  'stats.years': { en: 'Years of Excellence', ar: 'سنوات من التميز' },
  'stats.years_desc_prefix': { en: 'Shaping minds since', ar: 'نصقل العقول منذ' },
  'stats.specializations': { en: 'AI Specializations', ar: 'تخصصات الذكاء الاصطناعي' },
  'stats.specializations_desc': { en: 'From ML to Robotics & NLP', ar: 'من التعلم الآلي إلى الروبوتات ومعالجة اللغة' },
  'stats.partners': { en: 'Partner Universities', ar: 'جامعات شريكة' },
  'stats.partners_desc': { en: 'Global academic network', ar: 'شبكة أكاديمية عالمية' },
  'stats.top_dept': { en: 'AI Department', ar: 'قسم الذكاء الاصطناعي' },
  'stats.top_dept_desc_prefix': { en: 'Top AI program in', ar: 'أفضل برنامج ذكاء اصطناعي في' },

  // ── Calendar Section (homepage) ──
  'cal.label': { en: 'University Calendar', ar: 'التقويم الجامعي' },
  'cal.title_1': { en: 'Upcoming', ar: 'الأحداث' },
  'cal.title_2': { en: 'Events', ar: 'القادمة' },
  'cal.subtitle': { en: 'Stay on top of academic deadlines, seminars, and university events.', ar: 'ابقَ على اطلاع بالمواعيد الأكاديمية والندوات والفعاليات الجامعية.' },
  'cal.view_all': { en: 'View Full Calendar', ar: 'عرض التقويم الكامل' },
  'cal.no_events': { en: 'No upcoming events. Check back soon.', ar: 'لا توجد أحداث قادمة. تحقق لاحقاً.' },

  // ── Calendar Page ──
  'cal.page_label': { en: 'Academic Schedule', ar: 'الجدول الأكاديمي' },
  'cal.page_title_1': { en: 'University', ar: 'التقويم' },
  'cal.page_title_2': { en: 'Calendar', ar: 'الجامعي' },
  'cal.page_subtitle': { en: 'All upcoming events, deadlines, and seminars across all cohorts.', ar: 'جميع الأحداث والمواعيد والندوات القادمة لجميع الدفعات.' },
  'cal.no_events_title': { en: 'No Events Scheduled', ar: 'لا توجد أحداث مجدولة' },
  'cal.no_events_desc': { en: 'There are no upcoming events at the moment. Check back soon or visit the', ar: 'لا توجد أحداث قادمة حالياً. تحقق لاحقاً أو زر صفحة' },
  'cal.news_link': { en: 'News', ar: 'الأخبار' },
  'cal.filter_category': { en: 'Category', ar: 'الفئة' },
  'cal.filter_cohort': { en: 'Cohort', ar: 'الدفعة' },
  'cal.showing': { en: 'Showing', ar: 'عرض' },
  'cal.events_count': { en: 'event', ar: 'حدث' },
  'cal.events_count_plural': { en: 'events', ar: 'أحداث' },
  'cal.reset_filters': { en: 'Reset filters', ar: 'إعادة ضبط' },
  'cal.no_match': { en: 'No events match your filters.', ar: 'لا توجد أحداث تطابق الفلاتر.' },

  // ── News Section (homepage) ──
  'news.label': { en: 'Latest News', ar: 'آخر الأخبار' },
  'news.title_1': { en: "What's", ar: 'ما الذي' },
  'news.title_2': { en: 'Happening', ar: 'يحدث' },
  'news.view_all': { en: 'All News', ar: 'جميع الأخبار' },
  'news.featured': { en: '✦ Featured', ar: '✦ مميز' },
  'news.read_full': { en: 'Read Full Story', ar: 'اقرأ القصة الكاملة' },
  'news.read_more': { en: 'Read More →', ar: 'اقرأ المزيد ←' },
  'news.type_news': { en: 'News', ar: 'خبر' },
  'news.type_event': { en: 'Event', ar: 'حدث' },

  // ── News Page ──
  'news.page_label': { en: 'News & Announcements', ar: 'الأخبار والإعلانات' },
  'news.page_title_1': { en: 'News &', ar: 'الأخبار' },
  'news.page_title_2': { en: 'Announcements', ar: 'والإعلانات' },
  'news.page_subtitle': { en: 'Stay up to date with the latest research breakthroughs, campus events, and department announcements.', ar: 'ابقَ على اطلاع بأحدث الاختراقات البحثية وفعاليات الحرم الجامعي وإعلانات القسم.' },
  'news.no_articles': { en: 'No published articles yet.', ar: 'لا توجد مقالات منشورة بعد.' },



  // ── Classes Section (homepage) ──
  'classes.label': { en: 'Class Management', ar: 'إدارة الصفوف' },
  'classes.title_1': { en: 'Active', ar: 'الدفعات' },
  'classes.title_2': { en: 'Cohorts', ar: 'النشطة' },
  'classes.subtitle': { en: 'Browse all AI Engineering cohorts, their enrolled students, and class representatives.', ar: 'تصفح جميع دفعات هندسة الذكاء الاصطناعي وطلابها وممثليها.' },
  'classes.view_all': { en: 'All Classes', ar: 'جميع الصفوف' },
  'classes.students': { en: 'Students', ar: 'طالب' },
  'classes.rep': { en: 'Rep:', ar: 'الممثل:' },
  'classes.view_hub': { en: 'View Class Hub →', ar: '← عرض مركز الصف' },
  'classes.year_prefix': { en: 'AI Engineering — Year', ar: 'هندسة الذكاء الاصطناعي — السنة' },

  // ── Classes Page ──
  'classes.page_title_1': { en: 'AI Engineering', ar: 'دفعات هندسة' },
  'classes.page_title_2': { en: 'Cohorts', ar: 'الذكاء الاصطناعي' },
  'classes.total_students': { en: 'Total Students', ar: 'إجمالي الطلاب' },
  'classes.active_cohorts': { en: 'Active Cohorts', ar: 'الدفعات النشطة' },
  'classes.active_classes': { en: 'Active Classes', ar: 'الصفوف النشطة' },
  'classes.class_reps': { en: 'Class Reps', ar: 'ممثلو الصفوف' },
  'classes.representative': { en: 'Representative', ar: 'الممثل' },

  // ── Portfolio Page ──
  'portfolio.label': { en: 'Student Showcase', ar: 'معرض الطلاب' },
  'portfolio.title_1': { en: 'Student', ar: 'معرض' },
  'portfolio.title_2': { en: 'Portfolio', ar: 'الطلاب' },
  'portfolio.subtitle': { en: 'Explore AI Engineering student projects — from NLP models to robotics systems.', ar: 'استكشف مشاريع طلاب هندسة الذكاء الاصطناعي — من نماذج معالجة اللغة إلى أنظمة الروبوتات.' },
  'portfolio.no_projects': { en: 'No approved projects yet. Check back soon!', ar: 'لا توجد مشاريع معتمدة بعد. تحقق لاحقاً!' },
  'portfolio.filter_all': { en: 'All Projects', ar: 'جميع المشاريع' },
  'portfolio.github': { en: 'GitHub', ar: 'GitHub' },
  'portfolio.demo': { en: 'Live Demo', ar: 'عرض مباشر' },

  // ── Footer ──
  'footer.academic': { en: 'Academic', ar: 'أكاديمي' },
  'footer.community': { en: 'Community', ar: 'المجتمع' },
  'footer.institution': { en: 'Institution', ar: 'المؤسسة' },
  'footer.account': { en: 'Account', ar: 'الحساب' },
  'footer.programs': { en: 'Programs', ar: 'البرامج' },
  'footer.classes': { en: 'Classes', ar: 'الصفوف' },
  'footer.calendar': { en: 'Calendar', ar: 'التقويم' },
  'footer.research': { en: 'Research', ar: 'البحث العلمي' },
  'footer.news': { en: 'News', ar: 'الأخبار' },
  'footer.portfolio': { en: 'Portfolio', ar: 'المعرض' },
  'footer.events': { en: 'Events', ar: 'الفعاليات' },
  'footer.alumni': { en: 'Alumni', ar: 'الخريجون' },
  'footer.about': { en: 'About Us', ar: 'عنّا' },
  'footer.faculty': { en: 'Faculty', ar: 'الكادر التدريسي' },
  'footer.contact': { en: 'Contact', ar: 'اتصل بنا' },
  'footer.admin': { en: 'Admin Panel', ar: 'لوحة الإدارة' },
  'footer.signin': { en: 'Sign In', ar: 'تسجيل الدخول' },
  'footer.privacy': { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
  'footer.terms': { en: 'Terms of Service', ar: 'شروط الخدمة' },
  'footer.rights': { en: 'All rights reserved.', ar: 'جميع الحقوق محفوظة.' },
  'footer.developed_by': { en: 'Developed by', ar: 'تطوير' },
  'footer.supervised_by': { en: 'Supervised by', ar: 'إشراف' },

  // ── About Page ──
  'about.label': { en: 'About the Department', ar: 'عن القسم' },
  'about.hero_title_1': { en: 'Shaping the Future of', ar: 'نصنع مستقبل' },
  'about.hero_title_2': { en: 'AI Engineering', ar: 'هندسة الذكاء الاصطناعي' },
  'about.hero_sub': { en: "Al-Farabi University's AI Engineering Department — pioneering AI education in Iraq since 2018.", ar: 'قسم هندسة الذكاء الاصطناعي في جامعة الفارابي — ريادة تعليم الذكاء الاصطناعي في العراق منذ 2018.' },
  'about.founded': { en: 'Founded', ar: 'تأسست' },
  'about.students': { en: 'Students', ar: 'طالب' },
  'about.faculty_label': { en: 'Faculty', ar: 'أساتذة' },
  'about.papers': { en: 'Papers', ar: 'أبحاث' },
  'about.mission_label': { en: 'Our Mission', ar: 'مهمتنا' },
  'about.mission_title': { en: 'Building engineers who', ar: 'نبني مهندسين' },
  'about.mission_title_accent': { en: 'think', ar: 'يفكرون' },
  'about.mission_p1': { en: 'The Department of AI Engineering at Al-Farabi University exists to produce technically excellent, ethically grounded, and globally competitive AI engineers. We believe that the best engineers are those who understand not just how to build AI systems, but why they matter.', ar: 'يهدف قسم هندسة الذكاء الاصطناعي في جامعة الفارابي إلى تخريج مهندسين متفوقين تقنياً وأخلاقياً وقادرين على المنافسة عالمياً. نؤمن بأن أفضل المهندسين هم من يفهمون ليس فقط كيفية بناء أنظمة الذكاء الاصطناعي، بل لماذا هي مهمة.' },
  'about.mission_p2': { en: 'Our curriculum is designed with direct input from industry partners and is updated annually to reflect the rapid pace of AI research. From Cohort Year 1 learning programming fundamentals to Year 4 researchers publishing in conferences, every student is on a deliberate journey toward mastery.', ar: 'تم تصميم مناهجنا بمشاركة مباشرة من شركاء الصناعة ويتم تحديثها سنوياً لمواكبة التطور السريع في أبحاث الذكاء الاصطناعي. من طلاب السنة الأولى الذين يتعلمون أساسيات البرمجة إلى باحثي السنة الرابعة الذين ينشرون في المؤتمرات، كل طالب في رحلة مدروسة نحو الإتقان.' },
  'about.join_dept': { en: 'Join Our Department →', ar: '← انضم إلى قسمنا' },
  'about.history_label': { en: 'Our History', ar: 'تاريخنا' },
  'about.history_title_prefix': { en: 'Years of', ar: 'سنوات من' },
  'about.history_title_accent': { en: 'Legacy', ar: 'الإرث' },
  'about.faculty_section_label': { en: 'Meet the Team', ar: 'تعرف على الفريق' },
  'about.faculty_section_title': { en: 'Our', ar: 'كادرنا' },
  'about.faculty_section_accent': { en: 'Faculty', ar: 'التدريسي' },
  'about.contact_title': { en: 'Get in touch', ar: 'تواصل معنا' },
  'about.join_us': { en: 'Join Us', ar: 'انضم إلينا' },
  'about.send_email': { en: 'Send Email', ar: 'أرسل بريداً' },
  'about.value_research': { en: 'Research First', ar: 'البحث أولاً' },
  'about.value_research_desc': { en: 'Every course is grounded in active research. Students contribute to real publications from Year 2.', ar: 'كل مقرر مبني على أبحاث فعلية. يساهم الطلاب في نشر أبحاث حقيقية من السنة الثانية.' },
  'about.value_community': { en: 'Inclusive Community', ar: 'مجتمع شامل' },
  'about.value_community_desc': { en: 'A diverse cohort from across Iraq and the Middle East, united by a passion for AI.', ar: 'دفعات متنوعة من جميع أنحاء العراق والشرق الأوسط، يجمعها شغف الذكاء الاصطناعي.' },
  'about.value_industry': { en: 'Industry Readiness', ar: 'جاهزية سوق العمل' },
  'about.value_industry_desc': { en: 'Partnerships with tech companies ensure graduates are job-ready from day one.', ar: 'الشراكات مع شركات التقنية تضمن جاهزية الخريجين لسوق العمل من اليوم الأول.' },
  'about.value_ethics': { en: 'Ethical AI', ar: 'ذكاء اصطناعي أخلاقي' },
  'about.value_ethics_desc': { en: "AI Ethics and Governance is a core part of every year's curriculum, not an afterthought.", ar: 'أخلاقيات الذكاء الاصطناعي وحوكمته جزء أساسي من المنهج في كل سنة، وليس إضافة لاحقة.' },

  // ── Programs Page ──
  'programs.label': { en: 'Academic Offerings', ar: 'العروض الأكاديمية' },
  'programs.hero_title_1': { en: 'Programs &', ar: 'البرامج' },
  'programs.hero_title_2': { en: 'Curriculum', ar: 'والمناهج' },
  'programs.hero_sub': { en: "From foundational Bachelor's degrees to cutting-edge doctoral research — discover the full range of academic pathways in AI Engineering at Al-Farabi University.", ar: 'من درجات البكالوريوس الأساسية إلى الأبحاث الدكتوراه المتطورة — اكتشف جميع المسارات الأكاديمية في هندسة الذكاء الاصطناعي في جامعة الفارابي.' },
  'programs.flagship': { en: 'Flagship Program', ar: 'البرنامج الرئيسي' },
  'programs.all_label': { en: 'All Programs', ar: 'جميع البرامج' },
  'programs.choose_path': { en: 'Choose Your', ar: 'اختر مسارك' },
  'programs.choose_path_accent': { en: 'Academic Path', ar: 'الأكاديمي' },
  'programs.choose_sub': { en: 'Six distinct programs designed to meet every stage of your AI career — from entry-level learner to senior researcher.', ar: 'ستة برامج مميزة مصممة لتلبية كل مرحلة من مسيرتك في الذكاء الاصطناعي — من المبتدئ إلى الباحث المتقدم.' },
  'programs.key_modules': { en: 'Key Modules', ar: 'المقررات الرئيسية' },
  'programs.apply': { en: 'Apply', ar: 'تقديم' },
  'programs.apply_now': { en: 'Apply Now →', ar: '← قدّم الآن' },
  'programs.view_cohorts': { en: 'View Cohorts', ar: 'عرض الدفعات' },
  'programs.accreditation': { en: 'Accreditation & Details', ar: 'الاعتماد والتفاصيل' },
  'programs.highlights': { en: 'Program', ar: 'مميزات' },
  'programs.highlights_accent': { en: 'Highlights', ar: 'البرامج' },
  'programs.admissions': { en: 'Admissions', ar: 'القبول' },
  'programs.entry_req': { en: 'Entry', ar: 'شروط' },
  'programs.entry_req_accent': { en: 'Requirements', ar: 'القبول' },
  'programs.degree_levels': { en: 'Degree Levels', ar: 'مستويات الدرجات' },
  'programs.erasmus_partners': { en: 'ERASMUS+ Partners', ar: 'شركاء ERASMUS+' },
  'programs.published_papers': { en: 'Published Papers', ar: 'أبحاث منشورة' },
  'programs.grad_employment': { en: 'Graduate Employment', ar: 'توظيف الخريجين' },

  // ── Common / Breadcrumb ──
  'common.home': { en: 'Home', ar: 'الرئيسية' },
  'common.loading': { en: 'Loading...', ar: 'جاري التحميل...' },
  'common.est': { en: 'Est.', ar: 'تأسست' },
  'common.about': { en: 'About', ar: 'حول' },
  'common.programs': { en: 'Programs', ar: 'البرامج' },

  // ── Sign In ──
  'signin.title': { en: 'Admin Sign In', ar: 'تسجيل دخول المسؤول' },
  'signin.password': { en: 'Admin Password', ar: 'كلمة مرور المسؤول' },
  'signin.submit': { en: 'Sign In', ar: 'دخول' },
  'signin.error': { en: 'Invalid password', ar: 'كلمة مرور غير صحيحة' },
};

/**
 * Get a translated string by key.
 * Falls back to English if key not found.
 */
export function t(key: string, locale: Locale): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[locale] ?? entry.en ?? key;
}

export default translations;
