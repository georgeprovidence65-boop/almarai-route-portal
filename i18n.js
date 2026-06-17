(function () {
  const STORAGE_KEY = 'almaraiLanguage';

  const languages = {
    en: { label: 'English', dir: 'ltr' },
    ar: { label: 'العربية', dir: 'rtl' },
    hi: { label: 'हिन्दी', dir: 'ltr' },
    si: { label: 'සිංහල', dir: 'ltr' },
    bn: { label: 'বাংলা', dir: 'ltr' },
    ur: { label: 'اردو', dir: 'rtl' }
  };

  function p(ar, hi, si, bn, ur) {
    return { ar, hi, si, bn, ur };
  }

  const keyedPhrases = {
    language: 'Language',
    portalTitle: 'Almarai Portal',
    portalIntro: 'Scan one company QR, login, and open the right dashboard for your role.',
    phone: 'Phone',
    password: 'Password',
    login: 'Login',
    checkingLogin: 'Checking login...',
    loginFailed: 'Login failed',
    qrCode: 'QR Code',
    print: 'Print',
    open: 'Open',
    requestAccess: 'Request Access',
    fullName: 'Full Name',
    choosePassword: 'Choose Password/PIN',
    submitRequest: 'Submit Request',
    logout: 'Logout'
  };

  const phraseTranslations = {
    'Language': p('اللغة', 'भाषा', 'භාෂාව', 'ভাষা', 'زبان'),
    'Almarai Portal': p('بوابة المراعي', 'अलमराई पोर्टल', 'Almarai ද්වාරය', 'আলমারাই পোর্টাল', 'المراعی پورٹل'),
    'Scan one company QR, login, and open the right dashboard for your role.': p(
      'امسح رمز الشركة، سجل الدخول، وافتح اللوحة المناسبة لدورك.',
      'कंपनी QR स्कैन करें, लॉगिन करें, और अपनी भूमिका का सही डैशबोर्ड खोलें.',
      'සමාගම් QR එක ස්කෑන් කර, පිවිසී, ඔබගේ භූමිකාවට අදාළ පුවරුව විවෘත කරන්න.',
      'কোম্পানির QR স্ক্যান করুন, লগইন করুন, তারপর আপনার ভূমিকার সঠিক ড্যাশবোর্ড খুলুন।',
      'کمپنی QR اسکین کریں، لاگ ان کریں، اور اپنے کردار کا درست ڈیش بورڈ کھولیں۔'
    ),
    'Phone': p('الهاتف', 'फोन', 'දුරකථනය', 'ফোন', 'فون'),
    'Password': p('كلمة المرور', 'पासवर्ड', 'මුරපදය', 'পাসওয়ার্ড', 'پاس ورڈ'),
    'Login': p('تسجيل الدخول', 'लॉगिन', 'පිවිසෙන්න', 'লগইন', 'لاگ ان'),
    'Checking login...': p('جاري التحقق من الدخول...', 'लॉगिन जांच रहे हैं...', 'පිවිසුම පරීක්ෂා කරමින්...', 'লগইন যাচাই হচ্ছে...', 'لاگ ان چیک ہو رہا ہے...'),
    'Login failed': p('فشل تسجيل الدخول', 'लॉगिन विफल', 'පිවිසීම අසාර්ථකයි', 'লগইন ব্যর্থ', 'لاگ ان ناکام'),
    'QR Code': p('رمز QR', 'QR कोड', 'QR කේතය', 'QR কোড', 'QR کوڈ'),
    'Print': p('طباعة', 'प्रिंट', 'මුද්‍රණය', 'প্রিন্ট', 'پرنٹ'),
    'Open': p('فتح', 'खोलें', 'විවෘත කරන්න', 'খুলুন', 'کھولیں'),
    'No login yet?': p('ليس لديك تسجيل دخول؟', 'अभी लॉगिन नहीं है?', 'තවම පිවිසුමක් නැද්ද?', 'এখনও লগইন নেই?', 'ابھی لاگ ان نہیں ہے؟'),
    'Request Access': p('طلب دخول', 'एक्सेस अनुरोध', 'ප්‍රවේශය ඉල්ලන්න', 'অ্যাক্সেস অনুরোধ', 'رسائی کی درخواست'),
    'Full Name': p('الاسم الكامل', 'पूरा नाम', 'සම්පූර්ණ නම', 'পুরো নাম', 'پورا نام'),
    'Choose Password/PIN': p('اختر كلمة مرور/رمز PIN', 'पासवर्ड/PIN चुनें', 'මුරපදය/PIN තෝරන්න', 'পাসওয়ার্ড/PIN বেছে নিন', 'پاس ورڈ/PIN منتخب کریں'),
    'I am requesting access as': p('أطلب الدخول كـ', 'मैं इस भूमिका से एक्सेस चाहता हूं', 'මම ප්‍රවේශය ඉල්ලන්නේ', 'আমি যে ভূমিকায় অ্যাক্সেস চাই', 'میں اس کردار سے رسائی چاہتا ہوں'),
    'Customer': p('عميل', 'ग्राहक', 'පාරිභෝගිකයා', 'গ্রাহক', 'صارف'),
    'Salesman': p('مندوب مبيعات', 'सेल्समैन', 'විකුණුම් නියෝජිත', 'সেলসম্যান', 'سیلز مین'),
    'Manager': p('مدير', 'मैनेजर', 'කළමනාකරු', 'ম্যানেজার', 'منیجر'),
    'Admin': p('مسؤول', 'एडमिन', 'පරිපාලක', 'অ্যাডমিন', 'ایڈمن'),
    'Logistics': p('اللوجستيات', 'लॉजिस्टिक्स', 'ලොජිස්ටික්ස්', 'লজিস্টিকস', 'لاجسٹکس'),
    'Route': p('المسار', 'रूट', 'මාර්ගය', 'রুট', 'روٹ'),
    'Area': p('المنطقة', 'क्षेत्र', 'ප්‍රදේශය', 'এলাকা', 'علاقہ'),
    'Customer ID': p('رقم العميل', 'ग्राहक ID', 'පාරිභෝගික ID', 'গ্রাহক ID', 'کسٹمر ID'),
    'Notes': p('ملاحظات', 'नोट्स', 'සටහන්', 'নোট', 'نوٹس'),
    'Submit Request': p('إرسال الطلب', 'अनुरोध भेजें', 'ඉල්ලීම යවන්න', 'অনুরোধ পাঠান', 'درخواست بھیجیں'),
    'Logout': p('تسجيل الخروج', 'लॉग आउट', 'ඉවත් වන්න', 'লগ আউট', 'لاگ آؤٹ'),
    'Submitting request...': p('جاري إرسال الطلب...', 'अनुरोध भेज रहे हैं...', 'ඉල්ලීම යවමින්...', 'অনুরোধ পাঠানো হচ্ছে...', 'درخواست بھیجی جا رہی ہے...'),
    'Access request submitted. Please wait for manager approval.': p(
      'تم إرسال طلب الدخول. يرجى انتظار موافقة المدير.',
      'एक्सेस अनुरोध भेज दिया गया है. कृपया मैनेजर की स्वीकृति का इंतजार करें.',
      'ප්‍රවේශ ඉල්ලීම යවා ඇත. කරුණාකර කළමනාකරුගේ අනුමැතිය තෙක් රැඳී සිටින්න.',
      'অ্যাক্সেস অনুরোধ পাঠানো হয়েছে। ম্যানেজারের অনুমোদনের জন্য অপেক্ষা করুন।',
      'رسائی کی درخواست بھیج دی گئی ہے۔ براہ کرم منیجر کی منظوری کا انتظار کریں۔'
    ),

    'Almarai Manager Portal': p('بوابة مدير المراعي', 'अलमराई मैनेजर पोर्टल', 'Almarai කළමනාකරු ද්වාරය', 'আলমারাই ম্যানেজার পোর্টাল', 'المراعی منیجر پورٹل'),
    'Almarai Admin Dashboard': p('لوحة مسؤول المراعي', 'अलमराई एडमिन डैशबोर्ड', 'Almarai පරිපාලක පුවරුව', 'আলমারাই অ্যাডমিন ড্যাশবোর্ড', 'المراعی ایڈمن ڈیش بورڈ'),
    'Almarai Salesman Dashboard': p('لوحة مندوب المراعي', 'अलमराई सेल्समैन डैशबोर्ड', 'Almarai විකුණුම් පුවරුව', 'আলমারাই সেলসম্যান ড্যাশবোর্ড', 'المراعی سیلز مین ڈیش بورڈ'),
    'Almarai Customer Help': p('مساعدة عملاء المراعي', 'अलमराई ग्राहक सहायता', 'Almarai පාරිභෝගික සහාය', 'আলমারাই গ্রাহক সহায়তা', 'المراعی کسٹمر مدد'),
    'Areas, users, products, pricing, customers, QR codes, orders, and follow-up requests.': p(
      'المناطق، المستخدمون، المنتجات، الأسعار، العملاء، رموز QR، الطلبات، وطلبات المتابعة.',
      'क्षेत्र, उपयोगकर्ता, उत्पाद, कीमतें, ग्राहक, QR कोड, ऑर्डर और फॉलो-अप अनुरोध.',
      'ප්‍රදේශ, පරිශීලකයින්, නිෂ්පාදන, මිල, පාරිභෝගිකයන්, QR කේත, ඇණවුම් සහ පසු විපරම් ඉල්ලීම්.',
      'এলাকা, ব্যবহারকারী, পণ্য, দাম, গ্রাহক, QR কোড, অর্ডার এবং ফলো-আপ অনুরোধ।',
      'علاقے، صارفین، مصنوعات، قیمتیں، کسٹمرز، QR کوڈز، آرڈرز، اور فالو اپ درخواستیں۔'
    ),
    'Admin review only: customers, orders, requests, and stock support activity.': p(
      'مراجعة المسؤول فقط: العملاء، الطلبات، الطلبات المرسلة، ونشاط دعم المخزون.',
      'केवल एडमिन समीक्षा: ग्राहक, ऑर्डर, अनुरोध और स्टॉक सहायता गतिविधि.',
      'පරිපාලක සමාලෝචනය පමණි: පාරිභෝගිකයන්, ඇණවුම්, ඉල්ලීම් සහ තොග සහාය.',
      'শুধু অ্যাডমিন পর্যালোচনা: গ্রাহক, অর্ডার, অনুরোধ এবং স্টক সহায়তা কার্যক্রম।',
      'صرف ایڈمن جائزہ: کسٹمرز، آرڈرز، درخواستیں، اور اسٹاک سپورٹ سرگرمی۔'
    ),
    'Route 950 customer visits, map links, customer types, and follow-up requests.': p(
      'زيارات عملاء المسار 950، روابط الخرائط، أنواع العملاء، وطلبات المتابعة.',
      'रूट 950 ग्राहक विजिट, मैप लिंक, ग्राहक प्रकार और फॉलो-अप अनुरोध.',
      'මාර්ග 950 පාරිභෝගික සංචාර, සිතියම් සබැඳි, පාරිභෝගික වර්ග සහ පසු විපරම් ඉල්ලීම්.',
      'রুট 950 গ্রাহক ভিজিট, ম্যাপ লিংক, গ্রাহক ধরন এবং ফলো-আপ অনুরোধ।',
      'روٹ 950 کسٹمر وزٹس، میپ لنکس، کسٹمر اقسام، اور فالو اپ درخواستیں۔'
    ),
    'Choose a product area or send a request if you are not sure what to order.': p(
      'اختر منطقة المنتج أو أرسل طلبا إذا لم تكن متأكدا مما تطلب.',
      'उत्पाद क्षेत्र चुनें या अगर ऑर्डर तय नहीं है तो अनुरोध भेजें.',
      'ඇණවුම් කළ යුතු දේ විශ්වාස නැත්නම් නිෂ්පාදන ප්‍රදේශයක් තෝරන්න හෝ ඉල්ලීමක් යවන්න.',
      'কী অর্ডার করবেন নিশ্চিত না হলে পণ্যের এলাকা বেছে নিন বা অনুরোধ পাঠান।',
      'اگر آرڈر کا یقین نہیں تو پروڈکٹ ایریا منتخب کریں یا درخواست بھیجیں۔'
    ),

    'Backend:': p('الخادم:', 'बैकएंड:', 'Backend:', 'ব্যাকএন্ড:', 'بیک اینڈ:'),
    'Checking...': p('جاري الفحص...', 'जांच रहे हैं...', 'පරීක්ෂා කරමින්...', 'যাচাই হচ্ছে...', 'چیک ہو رہا ہے...'),
    'Connected': p('متصل', 'कनेक्टेड', 'සම්බන්ධයි', 'সংযুক্ত', 'منسلک'),
    'Request failed': p('فشل الطلب', 'अनुरोध विफल', 'ඉල්ලීම අසාර්ථකයි', 'অনুরোধ ব্যর্থ', 'درخواست ناکام'),
    'Refresh': p('تحديث', 'रीफ्रेश', 'නැවුම් කරන්න', 'রিফ্রেশ', 'ریفرش'),
    'Company QR': p('رمز الشركة QR', 'कंपनी QR', 'සමාගම් QR', 'কোম্পানি QR', 'کمپنی QR'),
    'Products': p('المنتجات', 'उत्पाद', 'නිෂ්පාදන', 'পণ্য', 'مصنوعات'),
    'Orders': p('الطلبات', 'ऑर्डर', 'ඇණවුම්', 'অর্ডার', 'آرڈرز'),
    'Customers': p('العملاء', 'ग्राहक', 'පාරිභෝගිකයන්', 'গ্রাহক', 'کسٹمرز'),
    'Route Customers': p('عملاء المسار', 'रूट ग्राहक', 'මාර්ග පාරිභෝගිකයන්', 'রুট গ্রাহক', 'روٹ کسٹمرز'),
    'Pending Requests': p('طلبات معلقة', 'लंबित अनुरोध', 'බලාපොරොත්තු ඉල්ලීම්', 'পেন্ডিং অনুরোধ', 'زیر التوا درخواستیں'),
    'Pending Access': p('دخول معلق', 'लंबित एक्सेस', 'බලාපොරොත්තු ප්‍රවේශ', 'পেন্ডিং অ্যাক্সেস', 'زیر التوا رسائی'),
    'Areas': p('المناطق', 'क्षेत्र', 'ප්‍රදේශ', 'এলাকা', 'علاقے'),
    'System Users': p('مستخدمو النظام', 'सिस्टम उपयोगकर्ता', 'පද්ධති පරිශීලකයන්', 'সিস্টেম ব্যবহারকারী', 'سسٹم صارفین'),
    'Access Requests': p('طلبات الدخول', 'एक्सेस अनुरोध', 'ප්‍රවේශ ඉල්ලීම්', 'অ্যাক্সেস অনুরোধ', 'رسائی کی درخواستیں'),
    'Need Help Requests': p('طلبات المساعدة', 'सहायता अनुरोध', 'උදව් ඉල්ලීම්', 'সহায়তা অনুরোধ', 'مدد کی درخواستیں'),
    'Customer Help Requests': p('طلبات مساعدة العملاء', 'ग्राहक सहायता अनुरोध', 'පාරිභෝගික උදව් ඉල්ලීම්', 'গ্রাহক সহায়তা অনুরোধ', 'کسٹمر مدد درخواستیں'),
    'Help Requests': p('طلبات المساعدة', 'सहायता अनुरोध', 'උදව් ඉල්ලීම්', 'সহায়তা অনুরোধ', 'مدد کی درخواستیں'),
    'Stock Support': p('دعم المخزون', 'स्टॉक सहायता', 'තොග සහාය', 'স্টক সহায়তা', 'اسٹاک سپورٹ'),
    'Salesman Stock Support': p('دعم مخزون المندوب', 'सेल्समैन स्टॉक सहायता', 'විකුණුම් තොග සහාය', 'সেলসম্যান স্টক সহায়তা', 'سیلز مین اسٹاک سپورٹ'),
    'Logistics Transfer Control': p('تحكم تحويلات اللوجستيات', 'लॉजिस्टिक्स ट्रांसफर नियंत्रण', 'ලොජිස්ටික් මාරු පාලනය', 'লজিস্টিকস ট্রান্সফার নিয়ন্ত্রণ', 'لاجسٹکس ٹرانسفر کنٹرول'),
    'Route Stock Ledger': p('سجل مخزون المسار', 'रूट स्टॉक लेजर', 'මාර්ග තොග ලේඛනය', 'রুট স্টক লেজার', 'روٹ اسٹاک لیجر'),
    'Price List': p('قائمة الأسعار', 'मूल्य सूची', 'මිල ලැයිස්තුව', 'মূল্য তালিকা', 'قیمتوں کی فہرست'),
    'Pricing': p('التسعير', 'कीमतें', 'මිලකරණය', 'দাম', 'قیمتیں'),
    'Customer Name': p('اسم العميل', 'ग्राहक नाम', 'පාරිභෝගික නම', 'গ্রাহকের নাম', 'کسٹمر نام'),
    'Type': p('النوع', 'प्रकार', 'වර්ගය', 'ধরন', 'قسم'),
    'Location': p('الموقع', 'लोकेशन', 'ස්ථානය', 'অবস্থান', 'مقام'),
    'Status': p('الحالة', 'स्थिति', 'තත්ත්වය', 'স্ট্যাটাস', 'حیثیت'),
    'Date': p('التاريخ', 'तारीख', 'දිනය', 'তারিখ', 'تاریخ'),
    'Amount': p('المبلغ', 'राशि', 'මුදල', 'পরিমাণ', 'رقم'),
    'Contact': p('التواصل', 'संपर्क', 'සම්බන්ධතා', 'যোগাযোগ', 'رابطہ'),
    'Category': p('الفئة', 'श्रेणी', 'කාණ්ඩය', 'ক্যাটাগরি', 'زمرہ'),
    'Customer Need': p('حاجة العميل', 'ग्राहक की जरूरत', 'පාරිභෝගික අවශ්‍යතාව', 'গ্রাহকের প্রয়োজন', 'کسٹمر کی ضرورت'),
    'Product': p('المنتج', 'उत्पाद', 'නිෂ්පාදනය', 'পণ্য', 'مصنوعات'),
    'Price': p('السعر', 'कीमत', 'මිල', 'দাম', 'قیمت'),
    'Stock': p('المخزون', 'स्टॉक', 'තොගය', 'স্টক', 'اسٹاک'),
    'Quantity': p('الكمية', 'मात्रा', 'ප්‍රමාණය', 'পরিমাণ', 'مقدار'),
    'Image URL': p('رابط الصورة', 'छवि URL', 'රූප URL', 'ছবির URL', 'تصویر URL'),
    'Add Customer': p('إضافة عميل', 'ग्राहक जोड़ें', 'පාරිභෝගිකයා එක් කරන්න', 'গ্রাহক যোগ করুন', 'کسٹمر شامل کریں'),
    'Add Product': p('إضافة منتج', 'उत्पाद जोड़ें', 'නිෂ්පාදනය එක් කරන්න', 'পণ্য যোগ করুন', 'مصنوعہ شامل کریں'),
    'Add Request': p('إضافة طلب', 'अनुरोध जोड़ें', 'ඉල්ලීම එක් කරන්න', 'অনুরোধ যোগ করুন', 'درخواست شامل کریں'),
    'Add Area': p('إضافة منطقة', 'क्षेत्र जोड़ें', 'ප්‍රදේශයක් එක් කරන්න', 'এলাকা যোগ করুন', 'علاقہ شامل کریں'),
    'Create User Login': p('إنشاء دخول مستخدم', 'यूजर लॉगिन बनाएं', 'පරිශීලක පිවිසුම සාදන්න', 'ব্যবহারকারী লগইন তৈরি করুন', 'صارف لاگ ان بنائیں'),
    'Approve': p('موافقة', 'स्वीकृत करें', 'අනුමත කරන්න', 'অনুমোদন', 'منظور کریں'),
    'Reject': p('رفض', 'अस्वीकार करें', 'ප්‍රතික්ෂේප කරන්න', 'প্রত্যাখ্যান', 'رد کریں'),
    'Delete': p('حذف', 'हटाएं', 'මකන්න', 'মুছুন', 'حذف کریں'),
    'Open Map': p('افتح الخريطة', 'मैप खोलें', 'සිතියම විවෘත කරන්න', 'ম্যাপ খুলুন', 'میپ کھولیں'),
    'Save': p('حفظ', 'सेव', 'සුරකින්න', 'সংরক্ষণ', 'محفوظ کریں'),

    'Getting There - How To Access': p('الوصول - طريقة الدخول', 'पहुंचना - कैसे एक्सेस करें', 'එහි යාම - ප්‍රවේශ වන්නේ කෙසේද', 'কীভাবে অ্যাক্সেস করবেন', 'وہاں پہنچنا - رسائی کا طریقہ'),
    'Scan Depot QR': p('امسح QR المستودع', 'डिपो QR स्कैन करें', 'ඩිපෝ QR ස්කෑන් කරන්න', 'ডিপো QR স্ক্যান করুন', 'ڈپو QR اسکین کریں'),
    'Dashboard': p('لوحة التحكم', 'डैशबोर्ड', 'පුවරුව', 'ড্যাশবোর্ড', 'ڈیش بورڈ'),
    'Nearby Salesmen': p('المندوبون القريبون', 'नजदीकी सेल्समैन', 'ආසන්න විකුණුම් නියෝජිතයින්', 'কাছের সেলসম্যান', 'قریبی سیلز مین'),
    'Nearby Salesmen - 600m Radius': p('مندوبون قريبون - نطاق 600م', 'नजदीकी सेल्समैन - 600m दायरा', 'ආසන්න විකුණුම් නියෝජිතයින් - 600m', 'কাছের সেলসম্যান - 600m', 'قریبی سیلز مین - 600m دائرہ'),
    'While On Duty - Support Map': p('أثناء العمل - خريطة الدعم', 'ड्यूटी पर - सहायता मैप', 'රාජකාරියේදී - සහාය සිතියම', 'ডিউটিতে - সহায়তা ম্যাপ', 'ڈیوٹی پر - سپورٹ میپ'),
    'Request Or Offer Support': p('اطلب أو قدم الدعم', 'सहायता मांगें या दें', 'සහාය ඉල්ලන්න හෝ ලබා දෙන්න', 'সহায়তা চান বা দিন', 'مدد مانگیں یا پیش کریں'),
    'Request Help - I Need Stock': p('طلب مساعدة - أحتاج مخزون', 'सहायता मांगें - मुझे स्टॉक चाहिए', 'උදව් ඉල්ලන්න - මට තොග අවශ්‍යයි', 'সহায়তা চাই - আমার স্টক দরকার', 'مدد مانگیں - مجھے اسٹاک چاہیے'),
    'Offer Help - I Have Stock': p('تقديم مساعدة - لدي مخزون', 'सहायता दें - मेरे पास स्टॉक है', 'සහාය ලබා දෙන්න - මට තොග ඇත', 'সহায়তা দিন - আমার স্টক আছে', 'مدد دیں - میرے پاس اسٹاک ہے'),
    'Request Depot Support': p('طلب دعم المستودع', 'डिपो सहायता मांगें', 'ඩිපෝ සහාය ඉල්ලන්න', 'ডিপো সহায়তা চাই', 'ڈپو سپورٹ مانگیں'),
    'Professional Stock Transfer': p('تحويل مخزون احترافي', 'प्रोफेशनल स्टॉक ट्रांसफर', 'වෘත්තීය තොග මාරුව', 'পেশাদার স্টক ট্রান্সফার', 'پیشہ ور اسٹاک ٹرانسفر'),
    'Need Stock': p('أحتاج مخزون', 'स्टॉक चाहिए', 'තොග අවශ්‍යයි', 'স্টক দরকার', 'اسٹاک چاہیے'),
    'Offer Stock': p('تقديم مخزون', 'स्टॉक दें', 'තොග ලබා දෙන්න', 'স্টক দিন', 'اسٹاک دیں'),
    'Depot Support': p('دعم المستودع', 'डिपो सहायता', 'ඩිපෝ සහාය', 'ডিপো সহায়তা', 'ڈپو سپورٹ'),
    'Nearby / Approved Salesman': p('مندوب قريب / معتمد', 'नजदीकी / स्वीकृत सेल्समैन', 'ආසන්න / අනුමත විකුණුම් නියෝජිත', 'কাছের / অনুমোদিত সেলসম্যান', 'قریبی / منظور شدہ سیلز مین'),
    'Send Transfer Request': p('إرسال طلب تحويل', 'ट्रांसफर अनुरोध भेजें', 'මාරු ඉල්ලීම යවන්න', 'ট্রান্সফার অনুরোধ পাঠান', 'ٹرانسفر درخواست بھیجیں'),
    'Start Location Sharing': p('مشاركة الموقع', 'लोकेशन शेयरिंग शुरू करें', 'ස්ථානය බෙදාගැනීම ආරම්භ කරන්න', 'লোকেশন শেয়ারিং শুরু করুন', 'لوکیشن شیئرنگ شروع کریں'),
    'Map View': p('عرض الخريطة', 'मैप व्यू', 'සිතියම් දර්ශනය', 'ম্যাপ ভিউ', 'میپ ویو'),
    'Visit Plan': p('خطة الزيارة', 'विजिट प्लान', 'සංචාර සැලැස්ම', 'ভিজিট প্ল্যান', 'وزٹ پلان'),
    'New Order': p('طلب جديد', 'नया ऑर्डर', 'නව ඇණවුම', 'নতুন অর্ডার', 'نیا آرڈر'),
    'More': p('المزيد', 'अधिक', 'තවත්', 'আরও', 'مزید'),
    'Need Help Choosing?': p('تحتاج مساعدة في الاختيار؟', 'चुनने में मदद चाहिए?', 'තෝරාගැනීමට උදව් අවශ්‍යද?', 'বেছে নিতে সাহায্য দরকার?', 'انتخاب میں مدد چاہیے؟'),
    'Save My Delivery Location': p('حفظ موقع التسليم الخاص بي', 'मेरी डिलीवरी लोकेशन सेव करें', 'මගේ බෙදාහැරීමේ ස්ථානය සුරකින්න', 'আমার ডেলিভারি লোকেশন সংরক্ষণ করুন', 'میری ڈیلیوری لوکیشن محفوظ کریں'),
    'Delivery Status': p('حالة التسليم', 'डिलीवरी स्थिति', 'බෙදාහැරීමේ තත්ත්වය', 'ডেলিভারি স্ট্যাটাস', 'ڈیلیوری حیثیت'),
    'Contact Us': p('اتصل بنا', 'संपर्क करें', 'අප අමතන්න', 'যোগাযোগ করুন', 'رابطہ کریں'),
    'My Orders': p('طلباتي', 'मेरे ऑर्डर', 'මගේ ඇණවුම්', 'আমার অর্ডার', 'میرے آرڈرز'),
    'Order History': p('سجل الطلبات', 'ऑर्डर इतिहास', 'ඇණවුම් ඉතිහාසය', 'অর্ডার ইতিহাস', 'آرڈر تاریخ'),
    'My Balance': p('رصيدي', 'मेरा बैलेंस', 'මගේ ශේෂය', 'আমার ব্যালেন্স', 'میرا بیلنس'),
    'Place New Order': p('إنشاء طلب جديد', 'नया ऑर्डर दें', 'නව ඇණවුමක් දමන්න', 'নতুন অর্ডার দিন', 'نیا آرڈر دیں'),
    'Customer is not sure what to order. Need recommendation...': p(
      'العميل غير متأكد مما يطلب. يحتاج توصية...',
      'ग्राहक तय नहीं कर पा रहा कि क्या ऑर्डर करे. सुझाव चाहिए...',
      'පාරිභෝගිකයා ඇණවුම් කළ යුතු දේ විශ්වාස නැත. නිර්දේශයක් අවශ්‍යයි...',
      'গ্রাহক কী অর্ডার করবেন নিশ্চিত নন। সুপারিশ দরকার...',
      'کسٹمر کو معلوم نہیں کیا آرڈر کرے۔ سفارش چاہیے...'
    ),

    'All': p('الكل', 'सभी', 'සියල්ල', 'সব', 'سب'),
    'All Types': p('كل الأنواع', 'सभी प्रकार', 'සියලු වර්ග', 'সব ধরন', 'تمام اقسام'),
    'C - Cash': p('C - نقدي', 'C - नकद', 'C - මුදල්', 'C - নগদ', 'C - نقد'),
    'CD - Credit': p('CD - آجل', 'CD - क्रेडिट', 'CD - ණය', 'CD - ক্রেডিট', 'CD - کریڈٹ'),
    'Cash': p('نقدي', 'नकद', 'මුදල්', 'নগদ', 'نقد'),
    'Credit': p('آجل', 'क्रेडिट', 'ණය', 'ক্রেডিট', 'کریڈٹ'),
    'Pending': p('معلق', 'लंबित', 'බලාපොරොත්තු', 'পেন্ডিং', 'زیر التوا'),
    'Approved': p('موافق عليه', 'स्वीकृत', 'අනුමතයි', 'অনুমোদিত', 'منظور شدہ'),
    'Rejected': p('مرفوض', 'अस्वीकृत', 'ප්‍රතික්ෂේපයි', 'প্রত্যাখ্যাত', 'رد شدہ'),
    'Delivered': p('تم التسليم', 'डिलीवर हुआ', 'බෙදාහැර ඇත', 'ডেলিভার্ড', 'ڈیلیورڈ'),
    'Cancelled': p('ملغي', 'रद्द', 'අවලංගුයි', 'বাতিল', 'منسوخ')
  };

  const originalTextByNode = new WeakMap();
  const originalAttributeByNode = new WeakMap();
  let currentLanguage = 'en';
  let observer;
  let isApplying = false;

  function normalizeLanguage(code) {
    const value = String(code || '').toLowerCase();
    if (value.startsWith('ar')) return 'ar';
    if (value.startsWith('hi')) return 'hi';
    if (value.startsWith('si')) return 'si';
    if (value.startsWith('bn')) return 'bn';
    if (value.startsWith('ur')) return 'ur';
    return 'en';
  }

  function getInitialLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && languages[saved]) return saved;
    const browserLanguage = (navigator.languages && navigator.languages[0]) || navigator.language;
    return normalizeLanguage(browserLanguage);
  }

  function translateSource(source, lang) {
    const selected = languages[lang] ? lang : 'en';
    if (selected === 'en') return source;
    return (phraseTranslations[source] && phraseTranslations[source][selected]) || source;
  }

  function translateKey(key) {
    return translateSource(keyedPhrases[key] || key, currentLanguage);
  }

  function preserveWhitespace(source, translated) {
    if (source.trim() === translated) return source;
    const leading = source.match(/^\s*/)[0];
    const trailing = source.match(/\s*$/)[0];
    return `${leading}${translated}${trailing}`;
  }

  function localizeText(source, lang) {
    const trimmed = source.trim();
    if (!trimmed) return source;
    return preserveWhitespace(source, translateSource(trimmed, lang));
  }

  function shouldSkipNode(node) {
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return !element || Boolean(element.closest('script, style, noscript, textarea, [data-no-i18n]'));
  }

  function getOriginalText(node, allowRefresh) {
    const currentValue = node.nodeValue || '';
    if (!originalTextByNode.has(node)) {
      originalTextByNode.set(node, currentValue);
      return currentValue;
    }

    const stored = originalTextByNode.get(node);
    if (allowRefresh && currentValue !== localizeText(stored, currentLanguage)) {
      originalTextByNode.set(node, currentValue);
      return currentValue;
    }

    return stored;
  }

  function translateTextNode(node, allowRefresh) {
    if (shouldSkipNode(node)) return;
    const original = getOriginalText(node, allowRefresh);
    const translated = localizeText(original, currentLanguage);
    if (node.nodeValue !== translated) {
      node.nodeValue = translated;
    }
  }

  function getAttributeStore(element) {
    if (!originalAttributeByNode.has(element)) {
      originalAttributeByNode.set(element, {});
    }
    return originalAttributeByNode.get(element);
  }

  function translateAttribute(element, attribute, allowRefresh) {
    if (!element.hasAttribute(attribute) || shouldSkipNode(element)) return;
    const store = getAttributeStore(element);
    const currentValue = element.getAttribute(attribute) || '';

    if (!Object.prototype.hasOwnProperty.call(store, attribute)) {
      store[attribute] = currentValue;
    } else if (allowRefresh && currentValue !== localizeText(store[attribute], currentLanguage)) {
      store[attribute] = currentValue;
    }

    const translated = localizeText(store[attribute], currentLanguage);
    if (element.getAttribute(attribute) !== translated) {
      element.setAttribute(attribute, translated);
    }
  }

  function translateElement(element, allowRefresh) {
    if (shouldSkipNode(element)) return;

    if (element.dataset && element.dataset.i18n) {
      const translated = translateKey(element.dataset.i18n);
      if (element.textContent !== translated) {
        element.textContent = translated;
      }
    }

    if (element.dataset && element.dataset.i18nPlaceholder) {
      const translated = translateKey(element.dataset.i18nPlaceholder);
      if (element.placeholder !== translated) {
        element.placeholder = translated;
      }
    }

    translateAttribute(element, 'placeholder', allowRefresh);
    translateAttribute(element, 'title', allowRefresh);
    translateAttribute(element, 'aria-label', allowRefresh);

    if (element.matches('input[type="button"], input[type="submit"], input[type="reset"]')) {
      translateAttribute(element, 'value', allowRefresh);
    }
  }

  function translateTree(root, allowRefresh) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root, allowRefresh);
      return;
    }

    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;

    const elementRoot = root.nodeType === Node.DOCUMENT_NODE ? root.body : root;
    if (!elementRoot) return;

    if (elementRoot.nodeType === Node.ELEMENT_NODE) {
      translateElement(elementRoot, allowRefresh);
    }

    elementRoot.querySelectorAll('*').forEach((element) => translateElement(element, allowRefresh));

    const walker = document.createTreeWalker(elementRoot, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return shouldSkipNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });

    let node = walker.nextNode();
    while (node) {
      translateTextNode(node, allowRefresh);
      node = walker.nextNode();
    }
  }

  function installStyles() {
    if (document.getElementById('almarai-i18n-styles')) return;
    const style = document.createElement('style');
    style.id = 'almarai-i18n-styles';
    style.textContent = `
      .language-switcher {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 10px;
      }

      .language-switcher label {
        font-size: 12px;
        font-weight: 700;
      }

      .language-switcher select {
        min-width: 132px;
        border: 1px solid rgba(255, 255, 255, 0.55);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.95);
        color: #0a2238;
        font: inherit;
        padding: 7px 10px;
      }

      main > .language-switcher,
      body > .language-switcher {
        margin: 12px;
      }

      [dir="rtl"] body {
        text-align: right;
      }

      [dir="rtl"] input,
      [dir="rtl"] select,
      [dir="rtl"] textarea {
        text-align: right;
      }

      [dir="rtl"] table {
        direction: rtl;
      }
    `;
    document.head.appendChild(style);
  }

  function createLanguageSelector() {
    const wrapper = document.createElement('div');
    wrapper.className = 'language-switcher';
    wrapper.innerHTML = `
      <label data-i18n="language" for="languageSelect">Language</label>
      <select id="languageSelect" data-language-select></select>
    `;

    const select = wrapper.querySelector('select');
    Object.entries(languages).forEach(([code, language]) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = language.label;
      select.appendChild(option);
    });
    select.addEventListener('change', () => applyLanguage(select.value));
    return wrapper;
  }

  function mountLanguageSelector(targetSelector) {
    const target = document.querySelector(targetSelector || '[data-language-target]') || document.querySelector('header') || document.body;
    if (!target || target.querySelector('[data-language-select]')) return;
    target.appendChild(createLanguageSelector());
  }

  function applyLanguage(lang) {
    const selected = languages[lang] ? lang : 'en';
    currentLanguage = selected;
    window.AlmaraiI18n.currentLanguage = selected;
    localStorage.setItem(STORAGE_KEY, selected);
    document.documentElement.lang = selected;
    document.documentElement.dir = languages[selected].dir;

    document.querySelectorAll('[data-language-select]').forEach((select) => {
      select.value = selected;
    });

    runWithoutObserver(() => translateTree(document.body, false));
  }

  function getObserverOptions() {
    return {
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label'],
      childList: true,
      subtree: true
    };
  }

  function observeBody() {
    if (observer && document.body) {
      observer.observe(document.body, getObserverOptions());
    }
  }

  function runWithoutObserver(callback) {
    if (observer) {
      observer.disconnect();
    }
    isApplying = true;
    try {
      callback();
    } finally {
      isApplying = false;
      observeBody();
    }
  }

  function startObserver() {
    if (observer || !document.body) return;
    observer = new MutationObserver((mutations) => {
      if (isApplying) return;
      runWithoutObserver(() => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => translateTree(node, true));
          if (mutation.type === 'attributes') {
            translateTree(mutation.target, true);
          }
        });
      });
    });
    observeBody();
  }

  function start() {
    installStyles();
    mountLanguageSelector();
    applyLanguage(getInitialLanguage());
    startObserver();
  }

  window.AlmaraiI18n = {
    applyLanguage,
    currentLanguage,
    languages,
    mountLanguageSelector,
    t: translateKey
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
}());
