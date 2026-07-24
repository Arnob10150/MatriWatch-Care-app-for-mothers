export type ConditionSeverity = "watch" | "urgent";

export type ConditionInfo = {
  name: string;
  category:
    | "pregnancy_related"
    | "placenta_and_bleeding"
    | "infection"
    | "preexisting";
  severity: ConditionSeverity;
  /** Lowercase keywords/phrases matched against reported symptoms + free-text notes. */
  keywords: string[];
  note: string;
};

// Reference list only — this is keyword-based symptom matching against a
// curated clinical knowledge base, not a diagnostic model. No dataset maps
// free-text symptoms to this exact taxonomy, so we don't claim ML/prediction
// for it the way the trained maternal-risk/GDM/fetal-health models do.
export const CONDITIONS: ConditionInfo[] = [
  {
    name: "Gestational diabetes",
    category: "pregnancy_related",
    severity: "watch",
    keywords: ["excessive thirst", "frequent urination", "blurred vision", "fatigue", "high blood sugar"],
    note: "High blood sugar that develops during pregnancy. Needs blood-sugar monitoring and clinic follow-up.",
  },
  {
    name: "Gestational hypertension",
    category: "pregnancy_related",
    severity: "watch",
    keywords: ["high blood pressure", "headache", "swelling in hands", "swelling in face"],
    note: "New high blood pressure after 20 weeks without protein in urine. Needs regular BP checks.",
  },
  {
    name: "Pre-eclampsia",
    category: "pregnancy_related",
    severity: "urgent",
    keywords: [
      "severe headache",
      "blurred vision",
      "vision changes",
      "swelling in face",
      "swelling in hands",
      "upper abdominal pain",
      "sudden weight gain",
    ],
    note: "High blood pressure with signs of organ stress. Contact your clinic urgently for same-day review.",
  },
  {
    name: "Eclampsia",
    category: "pregnancy_related",
    severity: "urgent",
    keywords: ["seizure", "convulsion", "loss of consciousness"],
    note: "Seizures related to pre-eclampsia. This is a medical emergency — seek emergency care immediately.",
  },
  {
    name: "HELLP syndrome",
    category: "pregnancy_related",
    severity: "urgent",
    keywords: ["upper abdominal pain", "nausea and vomiting", "severe headache", "right shoulder pain"],
    note: "A severe pregnancy complication affecting the liver and blood. Seek emergency care immediately.",
  },
  {
    name: "Iron-deficiency anaemia",
    category: "pregnancy_related",
    severity: "watch",
    keywords: ["fatigue", "weak", "pale skin", "shortness of breath", "dizzy"],
    note: "Low iron levels causing fatigue and weakness. Discuss iron supplementation with your clinic.",
  },
  {
    name: "Hyperemesis gravidarum",
    category: "pregnancy_related",
    severity: "urgent",
    keywords: ["severe vomiting", "persistent vomiting", "can't keep food down", "dehydration", "weight loss"],
    note: "Severe, persistent vomiting that can cause dehydration. Contact your clinic — may need IV fluids.",
  },
  {
    name: "Intrahepatic cholestasis of pregnancy",
    category: "pregnancy_related",
    severity: "urgent",
    keywords: ["severe itching", "itching hands", "itching feet", "dark urine", "yellowing skin"],
    note: "A liver condition causing intense itching, usually on palms/soles. Contact your clinic promptly.",
  },
  {
    name: "Pregnancy-related depression and anxiety",
    category: "pregnancy_related",
    severity: "watch",
    keywords: ["sad mood", "anxious", "panic", "cry", "hopeless", "poor sleep", "loss of interest"],
    note: "Common and treatable. Complete a Mood Check and talk to your clinic — support is available.",
  },
  {
    name: "Deep-vein thrombosis or pulmonary embolism",
    category: "pregnancy_related",
    severity: "urgent",
    keywords: ["leg swelling", "leg pain", "one leg swollen", "chest pain", "shortness of breath", "rapid heartbeat"],
    note: "A blood clot in the leg or lung. This is a medical emergency — seek emergency care immediately.",
  },
  {
    name: "Placenta previa",
    category: "placenta_and_bleeding",
    severity: "urgent",
    keywords: ["painless bleeding", "vaginal bleeding", "bright red bleeding"],
    note: "Placenta covering or near the cervix. Any bleeding needs urgent clinic or emergency evaluation.",
  },
  {
    name: "Placental abruption",
    category: "placenta_and_bleeding",
    severity: "urgent",
    keywords: ["sudden abdominal pain", "vaginal bleeding", "back pain", "contractions", "abdominal pain with bleeding"],
    note: "The placenta separating early. This is a medical emergency — seek emergency care immediately.",
  },
  {
    name: "Placenta accreta spectrum",
    category: "placenta_and_bleeding",
    severity: "urgent",
    keywords: ["heavy bleeding after delivery", "placenta not delivering"],
    note: "Placenta grows too deeply into the uterine wall. Requires specialist delivery planning.",
  },
  {
    name: "Ectopic pregnancy",
    category: "placenta_and_bleeding",
    severity: "urgent",
    keywords: ["sharp abdominal pain", "one-sided pain", "shoulder pain", "vaginal bleeding", "dizzy and pain", "fainting"],
    note: "A pregnancy outside the uterus. This is a medical emergency — seek emergency care immediately.",
  },
  {
    name: "Miscarriage",
    category: "placenta_and_bleeding",
    severity: "urgent",
    keywords: ["cramping and bleeding", "vaginal bleeding", "tissue passing", "loss of pregnancy symptoms"],
    note: "Vaginal bleeding with cramping in early pregnancy needs prompt clinic evaluation.",
  },
  {
    name: "Premature rupture of membranes",
    category: "placenta_and_bleeding",
    severity: "urgent",
    keywords: ["water broke", "fluid leaking", "gush of fluid", "constant leaking fluid"],
    note: "Waters breaking before labor starts or before term. Contact your clinic immediately.",
  },
  {
    name: "Preterm labour",
    category: "placenta_and_bleeding",
    severity: "urgent",
    keywords: ["regular contractions", "early contractions", "pelvic pressure", "lower back pain with contractions"],
    note: "Labor signs before 37 weeks. Contact your clinic immediately.",
  },
  {
    name: "Postpartum haemorrhage",
    category: "placenta_and_bleeding",
    severity: "urgent",
    keywords: ["heavy bleeding after delivery", "soaking through pads", "large blood clots after delivery"],
    note: "Severe bleeding after delivery. This is a medical emergency — seek emergency care immediately.",
  },
  {
    name: "Maternal infection or sepsis",
    category: "infection",
    severity: "urgent",
    keywords: ["high fever", "chills", "rapid heartbeat", "confusion", "foul-smelling discharge"],
    note: "Signs of a serious infection spreading in the body. Seek emergency care immediately.",
  },
  {
    name: "Urinary tract infection or kidney infection",
    category: "infection",
    severity: "watch",
    keywords: ["burning urination", "frequent urination", "back pain with fever", "cloudy urine"],
    note: "A urinary infection that can affect the kidneys if untreated. Contact your clinic.",
  },
  {
    name: "Group B streptococcus infection",
    category: "infection",
    severity: "watch",
    keywords: ["gbs positive", "group b strep"],
    note: "A common bacterium screened for late in pregnancy to prevent newborn infection.",
  },
  {
    name: "HIV/AIDS",
    category: "infection",
    severity: "watch",
    keywords: ["hiv", "aids"],
    note: "Managed with antiretroviral treatment during pregnancy to protect mother and baby.",
  },
  {
    name: "Hepatitis B or C",
    category: "infection",
    severity: "watch",
    keywords: ["hepatitis", "jaundice", "yellowing skin"],
    note: "A liver infection that needs monitoring and may require newborn prophylaxis at birth.",
  },
  {
    name: "Syphilis and other sexually transmitted infections",
    category: "infection",
    severity: "watch",
    keywords: ["syphilis", "genital sores", "rash on palms"],
    note: "Treatable with antibiotics; screening and treatment protect the baby.",
  },
  {
    name: "Tuberculosis",
    category: "infection",
    severity: "watch",
    keywords: ["persistent cough", "coughing blood", "night sweats", "weight loss with cough"],
    note: "A cough lasting more than two weeks, especially with weight loss or night sweats, needs evaluation.",
  },
  {
    name: "Malaria",
    category: "infection",
    severity: "urgent",
    keywords: ["fever and chills", "high fever", "sweating", "body aches with fever"],
    note: "Especially dangerous in pregnancy. Fever with chills needs same-day testing and treatment.",
  },
  {
    name: "Toxoplasmosis",
    category: "infection",
    severity: "watch",
    keywords: ["toxoplasmosis", "flu-like symptoms", "swollen lymph nodes"],
    note: "An infection often from undercooked meat or cat litter exposure; discuss testing with your clinic.",
  },
  {
    name: "Rubella",
    category: "infection",
    severity: "watch",
    keywords: ["rubella", "rash with fever", "swollen glands"],
    note: "A viral infection that can affect the baby's development; report any rash-with-fever illness.",
  },
  {
    name: "COVID-19 or influenza",
    category: "infection",
    severity: "watch",
    keywords: ["fever and cough", "shortness of breath", "loss of taste", "loss of smell", "sore throat", "flu symptoms"],
    note: "Respiratory infections can be more severe in pregnancy. Contact your clinic if symptoms worsen.",
  },
  {
    name: "Vaginal infections",
    category: "infection",
    severity: "watch",
    keywords: ["unusual discharge", "itching and discharge", "odor discharge"],
    note: "Common and treatable, but should be checked as some infections increase preterm labor risk.",
  },
  {
    name: "Chronic hypertension",
    category: "preexisting",
    severity: "watch",
    keywords: ["chronic high blood pressure", "high blood pressure before pregnancy"],
    note: "Pre-existing high blood pressure needs closer monitoring throughout pregnancy.",
  },
  {
    name: "Type 1 or type 2 diabetes",
    category: "preexisting",
    severity: "watch",
    keywords: ["diabetes", "high blood sugar", "insulin"],
    note: "Pre-existing diabetes requires tight blood-sugar control before and during pregnancy.",
  },
  {
    name: "Thyroid disease",
    category: "preexisting",
    severity: "watch",
    keywords: ["thyroid", "hyperthyroid", "hypothyroid", "goiter"],
    note: "Thyroid levels affect pregnancy outcomes and should be monitored by your clinic.",
  },
  {
    name: "Heart disease",
    category: "preexisting",
    severity: "urgent",
    keywords: ["heart disease", "chest pain", "palpitations", "shortness of breath with activity"],
    note: "Pre-existing heart conditions need specialist co-management during pregnancy.",
  },
  {
    name: "Kidney disease",
    category: "preexisting",
    severity: "watch",
    keywords: ["kidney disease", "protein in urine", "swelling with kidney history"],
    note: "Pre-existing kidney disease increases risk of complications and needs specialist follow-up.",
  },
  {
    name: "Asthma",
    category: "preexisting",
    severity: "watch",
    keywords: ["asthma", "wheezing", "shortness of breath"],
    note: "Asthma should be well controlled during pregnancy — report any increase in symptoms.",
  },
  {
    name: "Epilepsy",
    category: "preexisting",
    severity: "urgent",
    keywords: ["epilepsy", "seizure", "convulsion"],
    note: "Seizure disorders need careful medication management during pregnancy — any seizure is urgent.",
  },
  {
    name: "Lupus and other autoimmune diseases",
    category: "preexisting",
    severity: "watch",
    keywords: ["lupus", "joint pain with rash", "autoimmune"],
    note: "Autoimmune conditions can flare during pregnancy and need specialist monitoring.",
  },
  {
    name: "Obesity",
    category: "preexisting",
    severity: "watch",
    keywords: ["obesity", "high bmi"],
    note: "Higher BMI increases risk of several pregnancy complications — your clinic can advise on monitoring.",
  },
  {
    name: "Sickle-cell disease or other blood disorders",
    category: "preexisting",
    severity: "urgent",
    keywords: ["sickle cell", "severe pain crisis", "blood disorder"],
    note: "Sickle-cell disease raises pregnancy risk and needs specialist co-management; pain crises are urgent.",
  },
];

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

/**
 * Keyword-matches reported symptoms and free-text notes against the
 * clinical condition reference list. Returns matches ranked by number of
 * keyword hits, most-relevant first.
 */
export function matchConditions(symptoms: string[], notes?: string): ConditionInfo[] {
  const haystack = [...symptoms.map(normalize), normalize(notes ?? "")].join(" ; ");
  if (!haystack.trim()) return [];

  const scored = CONDITIONS.map((condition) => {
    const hits = condition.keywords.filter((keyword) => haystack.includes(keyword)).length;
    return { condition, hits };
  }).filter((entry) => entry.hits > 0);

  scored.sort((a, b) => b.hits - a.hits);
  return scored.map((entry) => entry.condition);
}
