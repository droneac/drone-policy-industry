"use client";

import { useMemo, useState } from "react";

type Country = {
  id: string;
  name: string;
  flag: string;
  region: string;
  authority: string;
  model: string;
  exam: string;
  industry: string;
  signal: string;
  maturity: number;
  restriction: number;
  market: number;
  examClarity: number;
  tags: string[];
  useCases: string[];
  sources: { label: string; href: string }[];
};

type Language = "ko" | "en";
type ClassificationModal = "pilot" | "aircraft" | null;

type ComplianceProfile = {
  operator: string;
  equipment: string;
  agencies: string;
  portals: { label: string; href: string; note: string }[];
};

type ClassificationProfile = {
  pilot: string;
  aircraft: string;
  note: string;
  links: { label: string; href: string }[];
};

type CriteriaSet = {
  pilot: { label: string; criterion: string }[];
  aircraft: { label: string; criterion: string }[];
};

type WeightCriteria = {
  pilot: string;
  aircraft: string;
};

const icaoResources = [
  {
    label: "ICAO Unmanned Aviation",
    href: "https://www.icao.int/UA",
    note: "무인항공, RPAS, AAM 관련 ICAO 글로벌 기준·지침 허브",
  },
  {
    label: "ICAO UAS Toolkit",
    href: "https://www.icao.int/UA/UASToolkit/home",
    note: "국가별 UAS 규정 수립과 안전·보안·개인정보 고려사항 참고 자료",
  },
  {
    label: "ICAO Model UAS Regulations",
    href: "https://www.icao.int/UA/icao-model-uas-regulations",
    note: "회원국이 활용할 수 있는 Part 101·102·149 모델 규정과 자문회람",
  },
  {
    label: "ICAO RPASP",
    href: "https://www.icao.int/UA/remotely-piloted-aircraft-systems-panel-rpasp",
    note: "RPAS SARPs, 절차, 지침 개발을 담당하는 ICAO 전문 패널",
  },
  {
    label: "ICAO RPAS Manual Doc 10019",
    href: "https://www.icao.int/filebrowser/download/4913?fid=4913",
    note: "RPAS 통합, 운항, 인증, 안전관리, C2 Link 등 기본 지침서",
  },
  {
    label: "ICAO UAS·RPAS Webinars and Symposia",
    href: "https://www.icao.int/sites/default/files/left-menu-pdfs/UAS%20and%20RPAS%20Webinars%20and%20Symposia%20-%20ICAO%20TV%20Links.pdf",
    note: "UAS·RPAS·UTM·AAM 관련 ICAO 행사·웨비나 영상 자료 링크 모음",
  },
  {
    label: "ICAO TV Unmanned Aviation",
    href: "https://www.icao.tv/unmanned-aviation-uas",
    note: "DRONE ENABLE, RPAS 심포지엄 등 ICAO 영상·행사 자료",
  },
  {
    label: "ICAO RPAS SARPs Adoption News",
    href: "https://www.icao.int/news/icao-council-adopts-new-international-aviation-standards-and-recommended-practices-remotely",
    note: "RPAS 통합 관련 국제 표준·권고방식 채택 소식",
  },
];

const icaoNotesEn: Record<string, string> = {
  "https://www.icao.int/UA": "ICAO's global hub for unmanned aviation, RPAS, UAS, and AAM guidance.",
  "https://www.icao.int/UA/UASToolkit/home": "Toolkit for states preparing UAS rules, safety policy, security, and privacy measures.",
  "https://www.icao.int/UA/icao-model-uas-regulations": "Model Part 101, Part 102, and Part 149 regulations and advisory circulars for member states.",
  "https://www.icao.int/UA/remotely-piloted-aircraft-systems-panel-rpasp": "ICAO expert panel developing RPAS SARPs, procedures, and guidance.",
  "https://www.icao.int/filebrowser/download/4913?fid=4913": "Core RPAS manual covering integration, operations, certification, safety management, and C2 links.",
  "https://www.icao.int/sites/default/files/left-menu-pdfs/UAS%20and%20RPAS%20Webinars%20and%20Symposia%20-%20ICAO%20TV%20Links.pdf": "ICAO TV links for UAS, RPAS, UTM, and AAM webinars and symposia.",
  "https://www.icao.tv/unmanned-aviation-uas": "ICAO videos and event material including DRONE ENABLE and RPAS symposia.",
  "https://www.icao.int/news/icao-council-adopts-new-international-aviation-standards-and-recommended-practices-remotely": "News on ICAO Council adoption of international SARPs for RPAS integration.",
};

const safetyCases = [
  {
    category: "공항·유인기 근접 위험",
    focus: "공항 주변 무단비행, 유인기와의 공중충돌 위험, 관제권 안전",
    lesson: "비행금지구역·공항 주변 제한·식별 및 신고 체계가 안전관리의 출발점입니다.",
    links: [
      {
        label: "FAA Drone Sightings Near Airports",
        href: "https://www.faa.gov/uas/resources/public_records/uas_sightings_report",
      },
      {
        label: "EASA UAS Safety Risk Portfolio and Analysis",
        href: "https://www.easa.europa.eu/en/document-library/general-publications/uas-safety-risk-portfolio-and-analysis",
      },
      {
        label: "FAA UAS Safety Resources",
        href: "https://www.faa.gov/uas",
      },
    ],
  },
  {
    category: "군중·도심 추락 및 인명 위해",
    focus: "어린이·군중 근접비행, 저고도 호버링, 조종 미숙에 따른 인체 접촉",
    lesson: "사람 위·사람 근처 비행은 거리 기준, 보호장치, 현장통제, 조종자 숙련도를 함께 봐야 합니다.",
    links: [
      {
        label: "AAIB DJI Air 2S Child Injury Report",
        href: "https://assets.publishing.service.gov.uk/media/62cd76ad8fa8f54e81e2ceee/DJI_Air_2S_UAS_reg_n-a_08-22.pdf",
      },
      {
        label: "AAIB Unmanned Aircraft Systems Reports",
        href: "https://www.gov.uk/aaib-reports?aircraft_category=unmanned-aircraft-systems",
      },
      {
        label: "AAIB Investigating Accidents to UAS",
        href: "https://www.gov.uk/government/publications/investigating-accidents-to-unmanned-aircraft-systems/investigating-accidents-to-unmanned-aircraft-systems",
      },
    ],
  },
  {
    category: "기체 결함·배터리·추락",
    focus: "배터리 이상, 로터·모터 문제, 강풍, 귀환 중 통제 상실",
    lesson: "정비·배터리 관리·기상 판단·비상절차가 소형 드론 안전에서도 핵심 관리항목입니다.",
    links: [
      {
        label: "AAIB DJI Matrice M210 Battery and Wind Event",
        href: "https://www.gov.uk/aaib-reports/aaib-investigation-to-dji-matrice-m210-version-1-uas-registration-n-a",
      },
      {
        label: "AAIB DJI Matrice 300 Rotor Failure",
        href: "https://www.gov.uk/aaib-reports/aaib-investigation-to-dji-matrice-300-rtk-uas-registration-n-a-030821",
      },
      {
        label: "AAIB DJI Mavic 2 Pro UAS Report",
        href: "https://assets.publishing.service.gov.uk/media/65563615d03a8d000d07faba/DJI_Mavic_2_Pro_UAS_registration_n-a_12-23.pdf",
      },
    ],
  },
  {
    category: "상업운항·물류 시험 사고",
    focus: "배송드론 시험 중 소프트웨어·모터·착륙장애물·회피기능 검증",
    lesson: "상업 운항은 단순 조종능력보다 소프트웨어 변경관리, 시험계획, 비상착륙구역 설계가 중요합니다.",
    links: [
      {
        label: "NTSB UAS Delivery Test Motor Stop Report",
        href: "https://data.ntsb.gov/carol-repgen/api/Aviation/ReportMain/GenerateNewestReport/199434/pdf",
      },
      {
        label: "NTSB UAS Safe Contingent Land Test Report",
        href: "https://data.ntsb.gov/carol-repgen/api/Aviation/ReportMain/GenerateNewestReport/199746/pdf",
      },
      {
        label: "NTSB UAS Motor Out Recovery Test Report",
        href: "https://data.ntsb.gov/carol-repgen/api/Aviation/ReportMain/GenerateNewestReport/195091/pdf",
      },
    ],
  },
  {
    category: "보안·불법비행·공공장소 위험",
    focus: "무단운용, 중요시설·공항·행사장 주변 비행, 법집행 및 처벌 리스크",
    lesson: "안전관리 체계에는 교육뿐 아니라 공역정보, 허가, 신고, 단속, 원격식별이 함께 필요합니다.",
    links: [
      {
        label: "FAA Critical Infrastructure and Public Venues",
        href: "https://www.faa.gov/uas/resources/community_engagement/no_drone_zone",
      },
      {
        label: "FAA UAS Public Records and Sightings",
        href: "https://www.faa.gov/uas/resources/public_records",
      },
      {
        label: "ICAO UAS Toolkit",
        href: "https://www.icao.int/UA/UASToolkit/home",
      },
    ],
  },
  {
    category: "안전조사·리스크 분석 자료",
    focus: "UAS 사고조사 기준, 발생보고, 위험영역 분석, 연간 안전동향",
    lesson: "사고사례는 개별 사건보다 반복 위험요인을 찾아 교육·시험·허가 기준에 반영하는 데 의미가 있습니다.",
    links: [
      {
        label: "EASA Annual Safety Review 2025",
        href: "https://www.easa.europa.eu/en/document-library/general-publications/annual-safety-review-2025",
      },
      {
        label: "AAIB UAS Investigation Policy",
        href: "https://www.gov.uk/government/publications/investigating-accidents-to-unmanned-aircraft-systems/investigating-accidents-to-unmanned-aircraft-systems",
      },
      {
        label: "ICAO RPAS Manual Doc 10019",
        href: "https://www.icao.int/filebrowser/download/4913?fid=4913",
      },
    ],
  },
  {
    category: "군용 대형 드론 추락·격추 DB",
    focus: "MALE급·대형 군용 무인기 추락, 격추, 손실 사례의 장기 축적 자료",
    lesson: "군용 무인기도 통신두절, 기체 결함, 운용환경, 대공위협에 취약하므로 대형·고가 플랫폼의 안전성·생존성 평가가 필요합니다.",
    links: [
      {
        label: "Drone Wars UK Drone Crash Database",
        href: "https://dronewars.net/drone-crash-database/",
      },
      {
        label: "Drone Wars UK Military Drone Crash Update",
        href: "https://dronewars.net/2024/06/24/male-performance-anxiety-technical-problems-and-sams-bring-large-drones-down-to-earth/",
      },
      {
        label: "Drone Wars UK Accidents Will Happen Report",
        href: "https://dronewars.net/2019/06/19/accidents-will-happen/",
      },
    ],
  },
];

const securityCases = [
  {
    category: "우크라이나전: 드론 대량운용과 C-UAS",
    focus: "정찰·FPV·장거리 타격 드론과 전자전·요격·분산방호가 동시에 고도화된 사례",
    lesson: "드론은 단일 장비가 아니라 생산·보급·전자전·대드론 방어가 결합된 전장 생태계로 봐야 합니다.",
    links: [
      {
        label: "NATO Ukraine Counter-UAS Lessons Learned",
        href: "https://shape.nato.int/NSATU/operational-insights/ukraine-counter-uncrewed-aircraft-systems-lessons-learned",
      },
      {
        label: "CSIS Seven Contemporary Insights on Ukraine War",
        href: "https://www.csis.org/analysis/seven-contemporary-insights-state-ukraine-war",
      },
      {
        label: "RUSI Protecting the Force from UAS",
        href: "https://www.rusi.org/explore-our-research/publications/occasional-papers/protecting-force-uncrewed-aerial-systems",
      },
    ],
  },
  {
    category: "드론 포화공격과 저비용 방어",
    focus: "저가 드론·자폭드론·미사일 혼합공격이 방공체계 비용교환비를 압박하는 사례",
    lesson: "대드론은 고가 요격체계만으로 부족하며 센서, 전자전, 기관포, 지향성에너지, 지휘통제가 계층화돼야 합니다.",
    links: [
      {
        label: "CSIS Drone Saturation Report",
        href: "https://csis-website-prod.s3.amazonaws.com/s3fs-public/2025-05/250513_Jensen_Drone_Saturations.pdf",
      },
      {
        label: "CNAS Countering the Swarm",
        href: "https://www.cnas.org/publications/reports/countering-the-swarm",
      },
      {
        label: "NATO C-UAS Interoperability Exercise",
        href: "https://www.ncia.nato.int/about-us/newsroom/nato-tests-counter-drone-technology-during-interoperability-exercise",
      },
    ],
  },
  {
    category: "나고르노-카라바흐 이후 전쟁 양상 변화",
    focus: "드론·배회탄약·정밀타격이 지상전, 방공망, 기갑운용에 미친 영향",
    lesson: "현대전에서 대드론은 후방 방호가 아니라 지상작전 기본 전제로 편입되고 있습니다.",
    links: [
      {
        label: "CEPA An Urgent Matter of Drones",
        href: "https://cepa.org/comprehensive-reports/an-urgent-matter-of-drones/",
      },
      {
        label: "RUSI Protecting the Force from UAS",
        href: "https://www.rusi.org/explore-our-research/publications/occasional-papers/protecting-force-uncrewed-aerial-systems",
      },
      {
        label: "RAND Military Drones Research",
        href: "https://www.rand.org/topics/military-drones.html",
      },
    ],
  },
  {
    category: "공급망·상용부품·AI 드론 경쟁",
    focus: "상용부품 의존, 중국산 부품 공급망, AI/ML 기반 드론 개발 경쟁",
    lesson: "국가안보형 드론산업은 완제품보다 핵심부품·통신·항법·AI·생산능력 확보가 중요합니다.",
    links: [
      {
        label: "RUSI Drones Win Battles, Components Win Wars",
        href: "https://www.rusi.org/explore-our-research/publications/commentary/drones-win-battles-components-win-wars",
      },
      {
        label: "ISW Current Russian and Ukrainian AI Drone Efforts",
        href: "https://www.understandingwar.org/wp-content/uploads/2025/06/The20Battlefield20AI20Revolution20Is20Not20Here20Yet20The20Status20of20Current20Russian20and20Ukrainian20AI20Drone20Efforts20PDF.pdf",
      },
      {
        label: "RAND Small UAS Adversary Capabilities",
        href: "https://www.rand.org/content/dam/rand/pubs/research_reports/RR3000/RR3023/RAND_RR3023.pdf",
      },
    ],
  },
  {
    category: "군용 드론 손실·격추 사례 데이터",
    focus: "대형 군용 드론 추락·격추 기록을 통해 운용위험과 방공위협을 추적",
    lesson: "사고 DB는 전술성과뿐 아니라 정비성, 생존성, 훈련, 임무위험 평가 자료로 활용할 수 있습니다.",
    links: [
      {
        label: "Drone Wars UK Drone Crash Database",
        href: "https://dronewars.net/drone-crash-database/",
      },
      {
        label: "Drone Wars UK Reports and Briefings",
        href: "https://dronewars.net/reports-and-briefings/",
      },
      {
        label: "Drone Wars UK Who Has Armed Drones?",
        href: "https://dronewars.net/who-has-armed-drones/",
      },
    ],
  },
];

const complianceKo: Record<string, ComplianceProfile> = {
  algeria: {
    operator: "공개자료 기준 별도 민간 조종자 자격시험보다 국가 무인항공시스템 센터 중심의 활동 관리와 허가 체계가 우선 확인됩니다.",
    equipment: "무인항공시스템 보유자는 국가 센터에 장비를 신고·등록해야 하며, 미신고 장비는 압류 등 제재 대상이 될 수 있습니다.",
    agencies: "국방부와 국가 무인항공시스템 센터가 핵심 관리기관으로 확인됩니다.",
    portals: [
      {
        label: "알제리 국방부 국가 UAS 센터 공지",
        href: "https://www.mdn.dz/site_principal/sommaire/actualites/an/2025/decembre/spot07122025an.php",
        note: "국가 무인항공시스템 센터 출범과 드론 활동 관리기관 역할을 안내합니다.",
      },
    ],
  },
  cambodia: {
    operator: "공개 공식자료 기준 전국 단일 조종자 자격시험 체계는 제한적으로 확인되며, 운용자는 비행 전 허가와 보안 지침 준수가 핵심입니다.",
    equipment: "장비 등록·안전성 인증보다 무단 운용 금지, 민감지역 회피, 보안기관 허가가 우선 강조됩니다.",
    agencies: "민간항공국(SSCA), 국방부, 치안·보안 당국을 함께 확인해야 합니다.",
    portals: [
      {
        label: "캄보디아 SSCA 공식 홈페이지",
        href: "https://civilaviation.gov.kh/",
        note: "항공 법령, 안전, 면허, 공공자료의 공식 출발점입니다.",
      },
      {
        label: "SSCA Drone Announcement",
        href: "https://civilaviation.gov.kh/legislation-regulations-and-publication/regulation/security-regulation/annoucement-drone?article_category_id=c45964b1-bfc7-4f36-bb59-0274a08d5c4e&article_category_title=security-regulation&article_id=86feb698-f5ef-453d-bb19-f18c96bf5cf2&article_title=annoucement-drone",
        note: "드론 관련 보안 규정 공지를 확인할 수 있습니다.",
      },
    ],
  },
  china: {
    operator: "CAAC 조종원 집조·등급 체계와 UOM 기반 시험·운용관리가 결합됩니다.",
    equipment: "민용 무인항공기 종합관리 플랫폼(UOM)을 통해 실명 등록, 운항 관리, 공역 정보 확인 등 장비·운항 관리를 통합적으로 다룹니다.",
    agencies: "CAAC, 국무원·중앙군사위원회, 공역·공안 관련 기관이 함께 작동합니다.",
    portals: [
      {
        label: "CAAC UOM 민용 무인항공기 종합관리 플랫폼",
        href: "https://uom.caac.gov.cn/",
        note: "정책·규정, 조작 안내, 정보 조회, 앱 다운로드를 제공하는 중국 핵심 관리 플랫폼입니다.",
      },
    ],
  },
  eu: {
    operator: "EASA 공통 규정 아래 원격조종자 역량증명과 운용자 등록은 각 회원국 항공당국이 집행합니다.",
    equipment: "운용자 등록, 원격식별, 지리구역, 운항승인, C등급 기체 기준이 위험기반 체계 안에서 연결됩니다.",
    agencies: "EASA는 공통 규칙을 제시하고, 실제 등록·시험·승인은 회원국 국가항공당국(NAA)이 처리합니다.",
    portals: [
      {
        label: "EASA Operator Registration and Pilot Competency",
        href: "https://www.easa.europa.eu/en/node/143656",
        note: "운용자 등록, 원격조종자 역량증명, 운항승인, NAA 역할을 설명합니다.",
      },
      {
        label: "EASA National Aviation Authorities Drone Links",
        href: "https://www.easa.europa.eu/en/domains/civil-drones/naa",
        note: "EU·EASA 국가별 드론 포털과 등록 절차 링크 모음입니다.",
      },
    ],
  },
  ghana: {
    operator: "GCAA RPAS 안전교육 수료가 드론 등록의 전제 조건으로 제시되며, RPAS 조종자 면허와 상업 운용자 절차도 별도 양식으로 운영됩니다.",
    equipment: "수입, 사용, BVLOS·고도 초과 운항, 판매 승인, 소유권 변경, 말소, 중복증명서 등 장비 생애주기 민원이 세분화되어 있습니다.",
    agencies: "GCAA가 RPAS 교육, 등록, 운항승인, 정비·상업운용 관련 민원을 관리합니다.",
    portals: [
      {
        label: "GCAA RPAS Online Safety Training",
        href: "https://www.gcaa.com.gh/dexam/course/rpas-online-course/",
        note: "드론 등록 전 필요한 RPAS 안전교육 온라인 과정입니다.",
      },
      {
        label: "GCAA RPAS Resources",
        href: "https://www.gcaa.com.gh/web/rpas-resources/",
        note: "수입·사용·BVLOS·판매·소유권 변경·조종자 면허 등 RPAS 신청 자료를 모은 페이지입니다.",
      },
      {
        label: "GCAA Online Portal",
        href: "https://portal.caa.com.gh/",
        note: "GCAA 로그인형 민원·신청 포털입니다.",
      },
    ],
  },
  japan: {
    operator: "Class 1·Class 2 무인항공기 조종자 기능증명과 DIPS 2.0 기반 신청 절차가 연결됩니다.",
    equipment: "100g 이상 무인항공기 등록, 기체 인증, 원격식별, 비행허가·승인 절차가 DIPS 및 MLIT 포털을 통해 관리됩니다.",
    agencies: "MLIT와 일본 민간항공국(JCAB)이 조종자, 기체, 운항허가 체계를 관리합니다.",
    portals: [
      {
        label: "MLIT DIPS 2.0",
        href: "https://www.ossportal.dips.mlit.go.jp/portal/top/?lang=en",
        note: "일본 드론 등록, 비행허가, 기능증명 신청을 처리하는 핵심 포털입니다.",
      },
      {
        label: "MLIT Unmanned Aircraft Registration WebPortal",
        href: "https://www.mlit.go.jp/koku/drone/en/",
        note: "의무 등록제와 비행규칙을 안내하는 영문 등록 포털입니다.",
      },
    ],
  },
  kenya: {
    operator: "KCAA는 Remote Aircraft Operators Certificate(ROC)와 UAS Training Organization(UTO) 체계를 통해 운용자와 교육기관을 관리합니다.",
    equipment: "UAS 규정, 시행기준, 수수료, 등록·재판매·운영자 인증 자료를 항공당국 UAS 페이지에서 제공합니다.",
    agencies: "KCAA가 UAS 등록, 운영자 인증, 훈련기관, 규정·수수료 체계를 총괄합니다.",
    portals: [
      {
        label: "KCAA Unmanned Aircraft Systems",
        href: "https://www.kcaa.or.ke/safety-security-oversight/unmanned-aircraft-systems",
        note: "케냐 UAS 규정, 시행기준, ROC, UTO, 수수료 자료를 모은 공식 페이지입니다.",
      },
    ],
  },
  korea: {
    operator: "초경량비행장치 조종자 증명, 전문교육기관, 사용사업 등록 등 운용자·사업자 제도가 분리되어 운영됩니다.",
    equipment: "드론원스톱에서 비행장치 신고, 사업등록 신고, 비행승인, 특별비행 승인, 항공촬영 신청 등 장비·운항 민원을 통합 처리합니다.",
    agencies: "국토교통부, 지방항공청, 한국교통안전공단(TS), 항공안전기술원 등이 자격·신고·안전성 검토 역할을 나눕니다.",
    portals: [
      {
        label: "드론원스톱 민원서비스",
        href: "https://drone.onestop.go.kr/",
        note: "비행장치 신고, 사업등록, 비행승인, 특별비행 승인, 항공촬영 신청을 통합 처리하는 대표 포털입니다.",
      },
      {
        label: "TS 드론 조종자 증명 시험",
        href: "https://main.kotsa.or.kr/portal/contents.do?menuCode=02020200",
        note: "초경량비행장치 조종자 증명 시험과 자격 정보를 제공합니다.",
      },
    ],
  },
  saudi: {
    operator: "GACA UAS 포털에서 Remote Pilot Certificate(RPC) 등 조종자·운용 관련 절차를 온라인으로 처리하는 구조가 확인됩니다.",
    equipment: "무인항공기 등록, 통관, 운항 관련 신청을 GACA UAS 포털과 Ajwaa 디지털 항공서비스에서 처리합니다.",
    agencies: "GACA가 UAS 등록·허가·자격·디지털 항공서비스를 총괄합니다.",
    portals: [
      {
        label: "GACA UAS Registration Portal",
        href: "https://uas.gaca.gov.sa/uas/",
        note: "무인항공기 등록, 원격조종자 증명, 통관 신청을 처리하는 공식 포털입니다.",
      },
      {
        label: "Ajwaa GACA Digital Services",
        href: "https://ajwaa.sa/",
        note: "허가, 면허, 인증, 규제 요청을 다루는 사우디 공식 디지털 항공서비스 포털입니다.",
      },
    ],
  },
  tanzania: {
    operator: "TCAA는 운영자 등록과 드론 조종자·운항 허가 절차를 함께 요구하며, 비거주자는 입국 전 사전 신청 부담이 큽니다.",
    equipment: "수입허가, 드론 등록, 운영자 등록, 운항허가가 단계적으로 요구됩니다.",
    agencies: "TCAA가 수입·등록·운영자 등록·운항허가 절차를 관리합니다.",
    portals: [
      {
        label: "TCAA Drone Permit Procedures",
        href: "https://tcaa.go.tz/pages/drones",
        note: "수입허가, 드론 등록, 운영자 등록, 운항허가 절차와 온라인 시스템 접근 방법을 안내합니다.",
      },
      {
        label: "TCAA Official Website",
        href: "https://tcaa.go.tz/",
        note: "Drone / Flight Portal 등 항공 민원 접근 경로를 제공하는 TCAA 공식 사이트입니다.",
      },
    ],
  },
  uae: {
    operator: "UAE Drones 플랫폼과 GCAA·DCAA 절차를 통해 운용자 로그인, 임무계획, 공역승인, 지역별 허가가 연결됩니다.",
    equipment: "UAS 등록, 통제공역 임무 승인, 두바이 RPAS 등록·허가, 기체·운항 기준이 연방·에미리트 단위로 관리됩니다.",
    agencies: "GCAA, DCAA, 내무부, NCEMA 등 연방·지역기관이 안전·보안·공역관리에 관여합니다.",
    portals: [
      {
        label: "UAE Drones Official Platform",
        href: "https://drones.gov.ae/",
        note: "통제공역 임무 승인, 실시간 공역 정보, 비행 리포트를 제공하는 UAE 공식 플랫폼입니다.",
      },
      {
        label: "UAE GCAA UAS Registration",
        href: "https://www.gcaa.gov.ae/en/Pages/UASRegistration.aspx/",
        note: "GCAA의 UAS 등록과 규제 프레임워크 안내 페이지입니다.",
      },
      {
        label: "DCAA Dubai Drone Service",
        href: "https://www.dcaa.gov.ae/services/aviation-safety-operations/drone-non-commercial-purpose",
        note: "두바이 지역 드론 등록·허가 서비스입니다.",
      },
    ],
  },
  usa: {
    operator: "상업·비레저 운용자는 Part 107 Remote Pilot Certificate와 24개월 recurrent training으로 역량을 유지합니다.",
    equipment: "FAA DroneZone에서 소형 드론 등록, 공역승인, 일부 운항관리 서비스를 처리하고, LAANC는 통제공역 신속 승인에 활용됩니다.",
    agencies: "FAA가 조종자 자격, 드론 등록, 공역승인, 면제·허가를 총괄합니다.",
    portals: [
      {
        label: "FAADroneZone",
        href: "https://faadronezone-access.faa.gov/",
        note: "드론 등록, 공역승인, 운항관리 서비스를 처리하는 FAA 공식 포털입니다.",
      },
      {
        label: "FAA Drone Registration",
        href: "https://www.faa.gov/uas/getting_started/register_drone",
        note: "드론 등록 대상과 FAA DroneZone 등록 절차를 안내합니다.",
      },
      {
        label: "FAA Part 107 Airspace Authorizations",
        href: "https://www.faa.gov/uas/commercial_operators/part_107_airspace_authorizations",
        note: "Part 107 조종자의 LAANC 및 공역승인 절차를 설명합니다.",
      },
    ],
  },
};

const complianceEn: Record<string, ComplianceProfile> = {
  algeria: {
    operator: "Public sources emphasize state activity management and permission through the National UAS Center more than an open civilian pilot examination framework.",
    equipment: "UAS owners are required to declare or register their systems with the national center, and undeclared equipment may be subject to enforcement action.",
    agencies: "The Ministry of National Defence and the National UAS Center are the key confirmed authorities.",
    portals: [
      {
        label: "Algerian Ministry of National Defence UAS Center Notice",
        href: "https://www.mdn.dz/site_principal/sommaire/actualites/an/2025/decembre/spot07122025an.php",
        note: "Announces the National UAS Center and its role in managing drone activities.",
      },
    ],
  },
  cambodia: {
    operator: "Public official sources show limited evidence of a detailed national pilot exam; operators should focus on flight permission and security compliance.",
    equipment: "The visible system emphasizes prohibition of unauthorized operation, sensitive-area avoidance, and security permission more than aircraft certification.",
    agencies: "SSCA, defence, police, and security authorities should be checked together.",
    portals: [
      {
        label: "Cambodia SSCA Official Website",
        href: "https://civilaviation.gov.kh/",
        note: "Official starting point for aviation legislation, safety, licensing, and public resources.",
      },
      {
        label: "SSCA Drone Announcement",
        href: "https://civilaviation.gov.kh/legislation-regulations-and-publication/regulation/security-regulation/annoucement-drone?article_category_id=c45964b1-bfc7-4f36-bb59-0274a08d5c4e&article_category_title=security-regulation&article_id=86feb698-f5ef-453d-bb19-f18c96bf5cf2&article_title=annoucement-drone",
        note: "Official SSCA drone-related security regulation notice.",
      },
    ],
  },
  china: {
    operator: "CAAC pilot licensing and rating requirements connect with UOM-based exam and operations management.",
    equipment: "The Civil UAS Integrated Management Platform (UOM) supports real-name registration, operational management, airspace information, and related compliance functions.",
    agencies: "CAAC, the State Council and Central Military Commission framework, and airspace or public-security bodies interact in implementation.",
    portals: [
      {
        label: "CAAC UOM Civil UAS Integrated Management Platform",
        href: "https://uom.caac.gov.cn/",
        note: "China's central UAS platform for policies, guides, information queries, technical support, and app access.",
      },
    ],
  },
  eu: {
    operator: "Under EASA common rules, remote pilot competency and operator registration are implemented by national aviation authorities.",
    equipment: "Operator registration, remote identification, geographical zones, operational authorization, and C-class aircraft requirements connect inside the risk-based framework.",
    agencies: "EASA sets common rules, while each National Aviation Authority handles practical registration, exams, and authorization.",
    portals: [
      {
        label: "EASA Operator Registration and Pilot Competency",
        href: "https://www.easa.europa.eu/en/node/143656",
        note: "Explains operator registration, pilot competency certificates, operational authorizations, and NAA roles.",
      },
      {
        label: "EASA National Aviation Authorities Drone Links",
        href: "https://www.easa.europa.eu/en/domains/civil-drones/naa",
        note: "Country-by-country drone portals and registration-process references supplied by NAAs.",
      },
    ],
  },
  ghana: {
    operator: "GCAA RPAS safety training is presented as a prerequisite for drone registration, with additional forms for RPAS pilot licensing and prospective commercial operators.",
    equipment: "Import, use, BVLOS or above-400-ft operation, sale authorization, ownership transfer, deregistration, duplicate certificates, and amendments are separated across RPAS resources.",
    agencies: "GCAA manages RPAS training, registration, operation authorization, maintenance, and commercial-operator matters.",
    portals: [
      {
        label: "GCAA RPAS Online Safety Training",
        href: "https://www.gcaa.com.gh/dexam/course/rpas-online-course/",
        note: "Online RPAS safety training required before drone registration.",
      },
      {
        label: "GCAA RPAS Resources",
        href: "https://www.gcaa.com.gh/web/rpas-resources/",
        note: "Official forms for import, use, BVLOS, sale, ownership transfer, pilot licensing, and maintenance.",
      },
      {
        label: "GCAA Online Portal",
        href: "https://portal.caa.com.gh/",
        note: "Login-based GCAA application portal.",
      },
    ],
  },
  japan: {
    operator: "Class 1 and Class 2 UA pilot certificates are linked to DIPS 2.0 application workflows.",
    equipment: "Registration for UA weighing 100 g or more, aircraft certification, remote ID, and flight permission or approval are handled through DIPS and MLIT portals.",
    agencies: "MLIT and JCAB manage pilot, aircraft, and flight-authorization systems.",
    portals: [
      {
        label: "MLIT DIPS 2.0",
        href: "https://www.ossportal.dips.mlit.go.jp/portal/top/?lang=en",
        note: "Core Japanese portal for drone registration, flight permission, and certificate applications.",
      },
      {
        label: "MLIT Unmanned Aircraft Registration WebPortal",
        href: "https://www.mlit.go.jp/koku/drone/en/",
        note: "English portal explaining mandatory registration and flight rules.",
      },
    ],
  },
  kenya: {
    operator: "KCAA uses Remote Aircraft Operators Certificates and UAS Training Organizations to manage operators and training providers.",
    equipment: "The KCAA UAS page provides regulations, implementation standards, fees, registration, resellers, ROC, and UTO materials.",
    agencies: "KCAA oversees UAS registration, operator certification, training organizations, rules, and fees.",
    portals: [
      {
        label: "KCAA Unmanned Aircraft Systems",
        href: "https://www.kcaa.or.ke/safety-security-oversight/unmanned-aircraft-systems",
        note: "Official Kenya page for UAS regulations, implementation standards, ROC, UTO, and fees.",
      },
    ],
  },
  korea: {
    operator: "Korea separates pilot certification, professional training institutions, and drone-service business registration.",
    equipment: "Drone One-Stop handles aircraft reporting, business registration, flight approval, special flight approval, and aerial photography applications.",
    agencies: "MOLIT, regional aviation offices, TS, and KIAST divide roles across pilot qualification, reporting, and safety review.",
    portals: [
      {
        label: "Drone One-Stop Civil Service",
        href: "https://drone.onestop.go.kr/",
        note: "Main integrated portal for aircraft reporting, business registration, flight approval, special approval, and aerial photography applications.",
      },
      {
        label: "TS Drone Pilot Certificate Exam",
        href: "https://main.kotsa.or.kr/portal/contents.do?menuCode=02020200",
        note: "Pilot certificate and exam information for ultralight vehicle operators.",
      },
    ],
  },
  saudi: {
    operator: "The GACA UAS portal supports online procedures including Remote Pilot Certificate processes.",
    equipment: "Unmanned aircraft registration, customs clearance, and operational applications are handled through the GACA UAS portal and Ajwaa digital aviation services.",
    agencies: "GACA oversees UAS registration, permits, qualifications, and digital aviation services.",
    portals: [
      {
        label: "GACA UAS Registration Portal",
        href: "https://uas.gaca.gov.sa/uas/",
        note: "Official portal for unmanned aircraft registration, Remote Pilot Certificate, and customs clearance.",
      },
      {
        label: "Ajwaa GACA Digital Services",
        href: "https://ajwaa.sa/",
        note: "Official Saudi aviation-services portal for permits, licenses, certificates, and regulatory requests.",
      },
    ],
  },
  tanzania: {
    operator: "TCAA requires operator registration and drone-operation permit procedures; non-residents face a substantial pre-application timeline.",
    equipment: "Import permit, drone registration, operator registration, and operations permit are required in sequence.",
    agencies: "TCAA manages import, registration, operator registration, and operation permit procedures.",
    portals: [
      {
        label: "TCAA Drone Permit Procedures",
        href: "https://tcaa.go.tz/pages/drones",
        note: "Official guide to import permit, drone registration, operator registration, operation permits, and online-system access.",
      },
      {
        label: "TCAA Official Website",
        href: "https://tcaa.go.tz/",
        note: "TCAA home page with access to Drone / Flight Portal and civil-aviation services.",
      },
    ],
  },
  uae: {
    operator: "UAE Drones and GCAA/DCAA workflows connect operator login, mission planning, airspace approval, and local permits.",
    equipment: "UAS registration, controlled-airspace mission approval, Dubai RPAS registration and permits, and aircraft-operation standards are managed at federal and emirate levels.",
    agencies: "GCAA, DCAA, the Ministry of Interior, NCEMA, and other federal or local bodies are involved in safety, security, and airspace management.",
    portals: [
      {
        label: "UAE Drones Official Platform",
        href: "https://drones.gov.ae/",
        note: "Official platform for controlled-airspace mission approvals, real-time airspace information, and flight reports.",
      },
      {
        label: "UAE GCAA UAS Registration",
        href: "https://www.gcaa.gov.ae/en/Pages/UASRegistration.aspx/",
        note: "GCAA page for UAS registration and regulatory framework information.",
      },
      {
        label: "DCAA Dubai Drone Service",
        href: "https://www.dcaa.gov.ae/services/aviation-safety-operations/drone-non-commercial-purpose",
        note: "Dubai drone registration and permit service.",
      },
    ],
  },
  usa: {
    operator: "Commercial and non-recreational operators use the Part 107 Remote Pilot Certificate and maintain currency through recurrent training every 24 months.",
    equipment: "FAA DroneZone handles small-drone registration, airspace authorizations, and selected operations-management services; LAANC supports rapid controlled-airspace authorization.",
    agencies: "FAA oversees pilot qualifications, drone registration, airspace authorization, waivers, and approvals.",
    portals: [
      {
        label: "FAADroneZone",
        href: "https://faadronezone-access.faa.gov/",
        note: "Official FAA portal for drone registration, airspace authorizations, and managing drone services.",
      },
      {
        label: "FAA Drone Registration",
        href: "https://www.faa.gov/uas/getting_started/register_drone",
        note: "FAA guidance on who must register and how to register through DroneZone.",
      },
      {
        label: "FAA Part 107 Airspace Authorizations",
        href: "https://www.faa.gov/uas/commercial_operators/part_107_airspace_authorizations",
        note: "Explains LAANC and controlled-airspace authorization for Part 107 pilots.",
      },
    ],
  },
};

const classificationKo: Record<string, ClassificationProfile> = {
  algeria: {
    pilot: "공개자료 기준 민간 조종자 자격증의 기종별·등급별 분류는 제한적으로 확인됩니다. 실제 운용은 국가 무인항공시스템 센터의 활동 승인과 보안관리 체계를 먼저 확인해야 합니다.",
    aircraft: "대통령령 기반 UAS 관리체계 아래 보유 장비 신고·등록이 핵심입니다. 세부 기체 등급보다 신고 대상성과 민감장비 취득 승인 여부가 중요합니다.",
    note: "확인필요: 세부 조종자 등급·기종 분류는 공개 영문자료가 제한적입니다.",
    links: [{ label: "알제리 국방부 국가 UAS 센터 공지", href: "https://www.mdn.dz/site_principal/sommaire/actualites/an/2025/decembre/spot07122025an.php" }],
  },
  cambodia: {
    pilot: "공개자료 기준 전국 단일 드론 조종자 자격증 분류는 명확히 확인되지 않습니다. 허가 없는 운용 금지와 보안기관 승인 여부가 실무상 우선됩니다.",
    aircraft: "장비 등급·안전성 인증 분류보다 비행 장소, 보안 민감도, 관할기관 허가 여부가 중심입니다.",
    note: "확인필요: 공식 포털형 등록·등급 체계보다 공지·허가 중심으로 접근하는 것이 안전합니다.",
    links: [{ label: "SSCA Drone Announcement", href: "https://civilaviation.gov.kh/legislation-regulations-and-publication/regulation/security-regulation/annoucement-drone?article_category_id=c45964b1-bfc7-4f36-bb59-0274a08d5c4e&article_category_title=security-regulation&article_id=86feb698-f5ef-453d-bb19-f18c96bf5cf2&article_title=annoucement-drone" }],
  },
  china: {
    pilot: "조종원 집조와 등급 체계를 기반으로 멀티콥터·고정익·헬리콥터·비행선 등 기종과 시계내·시계밖 운용범위가 결합됩니다.",
    aircraft: "민용 무인항공기는 중량·성능·운용위험에 따라 관리되며, UOM에서 실명등록, 공역정보, 운항관리, 관련 신청을 확인합니다.",
    note: "기체와 조종자 분류가 모두 운용위험과 연결되는 통합관리형 구조입니다.",
    links: [{ label: "CAAC UOM 플랫폼", href: "https://uom.caac.gov.cn/" }, { label: "CAAC 조종원 집조 시험관리방법", href: "https://uom.caac.gov.cn/api/home/anon/download/202405-33f0eecc-8802-4f4d-86a2-67430c0e4ae8/14caac8f-2ea3-4863-8d0a-389ad5de31fd" }],
  },
  eu: {
    pilot: "Open 카테고리는 A1·A2·A3 운용 하위범주별로 필요한 원격조종자 교육·시험 수준이 달라지고, Specific·Certified로 갈수록 별도 승인과 역량요건이 강화됩니다.",
    aircraft: "기체는 C0~C4 등급표시, 원격식별, MTOM, 운용거리 기준과 연결됩니다. A1은 사람 근처, A2는 사람 가까이, A3는 사람·건물에서 떨어진 운용으로 구분됩니다.",
    note: "EU는 조종자 자격보다 운용범주와 기체 C등급을 맞추는 위험기반 분류가 핵심입니다.",
    links: [{ label: "EASA Open Category", href: "https://www.easa.europa.eu/en/domains/drones-air-mobility/operating-drone/open-category-low-risk-civil-drones" }, { label: "EASA Operator Registration and Pilot Competency", href: "https://www.easa.europa.eu/en/node/143656" }],
  },
  ghana: {
    pilot: "RPAS 안전교육 수료가 등록 전제조건으로 제시되며, RPAS Pilot Licence, Prospective Commercial Operator, Maintenance Engineer 등 신청 항목이 분리되어 있습니다.",
    aircraft: "수입, 사용, BVLOS·400ft 초과 운용, 판매 승인, 소유권 변경, 수출, 말소, 중복증명서 등 장비 생애주기 신청이 구분됩니다.",
    note: "가나는 등급명보다 RPAS 신청 유형과 교육수료 기반 관리가 더 뚜렷합니다.",
    links: [{ label: "GCAA RPAS Online Safety Training", href: "https://www.gcaa.com.gh/dexam/course/rpas-online-course/" }, { label: "GCAA RPAS Resources", href: "https://www.gcaa.com.gh/web/rpas-resources/" }],
  },
  japan: {
    pilot: "무인항공기 조종자 기능증명은 Class 1과 Class 2로 구분됩니다. Class 1은 Level 4 등 고난도 운항과 연결되고, Class 2는 일반적·저위험 운항 기반입니다.",
    aircraft: "100g 이상 무인항공기는 등록 대상이며, 고위험 운항은 기체인증·비행허가·비행계획·비행일지·사고보고 절차와 연결됩니다.",
    note: "일본은 조종자 Class, 기체 등록·인증, 운항허가를 DIPS 2.0으로 묶는 구조입니다.",
    links: [{ label: "MLIT Flight Rules for Unmanned Aircraft", href: "https://www.mlit.go.jp/en/koku/uas.html" }, { label: "MLIT DIPS 2.0", href: "https://www.ossportal.dips.mlit.go.jp/portal/top/?lang=en" }, { label: "MLIT Registration WebPortal", href: "https://www.mlit.go.jp/koku/drone/en/" }],
  },
  kenya: {
    pilot: "Remote Aircraft Operators Certificate(ROC), Remote Pilot Licence 성격의 조종자 요건, UAS Training Organization(UTO) 체계가 운용자·교육기관 분류의 핵심입니다.",
    aircraft: "UAS 규정·시행기준·수수료 자료에서 등록, 리셀러·유통, 운영자 인증, 훈련기관을 구분해 관리합니다.",
    note: "케냐는 조종자 개인 자격보다 운영자 인증과 훈련기관 체계가 비교표에서 중요합니다.",
    links: [{ label: "KCAA Unmanned Aircraft Systems", href: "https://www.kcaa.or.ke/safety-security-oversight/unmanned-aircraft-systems" }],
  },
  korea: {
    pilot: "초경량비행장치 조종자 증명은 무인멀티콥터 등 기종별로 운영되고, 무게·위험도에 따라 1종·2종·3종·4종 등 등급형 교육·시험 체계가 적용됩니다.",
    aircraft: "드론원스톱을 통해 비행장치 신고, 사업등록, 비행승인, 특별비행승인, 항공촬영 신청을 처리하며, 고위험·특별운항은 안전성 검토와 관련기관 협의가 연결됩니다.",
    note: "한국은 조종자 증명, 기체신고, 사용사업, 특별비행승인을 분리하면서도 원스톱 민원으로 묶는 방식입니다.",
    links: [{ label: "드론원스톱 민원서비스", href: "https://drone.onestop.go.kr/" }, { label: "TS 드론 조종자 증명 시험", href: "https://main.kotsa.or.kr/portal/contents.do?menuCode=02020200" }, { label: "무인비행장치 자격·교육기관 고시", href: "https://law.go.kr/LSW/admRulLsInfoP.do?admRulSeq=2100000259052" }],
  },
  saudi: {
    pilot: "GACA UAS 포털에서 Remote Pilot Certificate(RPC) 등 운용자 자격 절차가 확인됩니다.",
    aircraft: "무인항공기 등록, 통관, 운항 관련 신청이 GACA UAS 포털과 Ajwaa 항공서비스 포털에서 처리됩니다.",
    note: "사우디는 세부 기체 등급 공개자료보다 등록·RPC·통관·허가 포털 흐름이 더 명확합니다.",
    links: [{ label: "GACA UAS Registration Portal", href: "https://uas.gaca.gov.sa/uas/" }, { label: "Ajwaa GACA Digital Services", href: "https://ajwaa.sa/" }],
  },
  tanzania: {
    pilot: "TCAA는 운영자 등록과 조종자·운항허가 절차를 요구하며, 비거주자는 사전 계정 발급과 신청 준비가 필요합니다.",
    aircraft: "수입허가, 드론 등록, 운영자 등록, 운항허가가 단계적으로 요구됩니다. 5kg 미만, 5~25kg 등 중량대별 수수료·허가 구조가 안내자료에서 확인됩니다.",
    note: "탄자니아는 기체 반입·등록·운항허가 순서가 실무상 가장 중요한 분류입니다.",
    links: [{ label: "TCAA Drone Permit Procedures", href: "https://tcaa.go.tz/pages/drones" }, { label: "Tanzania Drone Usage Conditions", href: "https://www.tfs.go.tz/uploads/documents/drone_tz_usage_conditions.pdf" }],
  },
  uae: {
    pilot: "UAE Drones와 GCAA/DCAA 절차에서 운용자 로그인, 임무계획, 공역승인, 지역별 허가가 연결됩니다.",
    aircraft: "UAS 등록, 통제공역 임무승인, 두바이 RPAS 등록·허가, 연방 CAR-UAS 기준이 장비·운항관리 축을 이룹니다.",
    note: "UAE는 연방 등록과 에미리트별 허가가 동시에 작동하는 도시형 공역관리 구조입니다.",
    links: [{ label: "UAE Drones Official Platform", href: "https://drones.gov.ae/" }, { label: "UAE GCAA UAS Registration", href: "https://www.gcaa.gov.ae/en/Pages/UASRegistration.aspx/" }, { label: "DCAA Dubai Drone Service", href: "https://www.dcaa.gov.ae/services/aviation-safety-operations/drone-non-commercial-purpose" }],
  },
  usa: {
    pilot: "상업·비레저 소형 UAS 운용은 Part 107 Remote Pilot Certificate가 핵심이며, 레크리에이션 비행은 TRUST와 별도 등록 규칙이 연결됩니다.",
    aircraft: "Part 107은 55파운드 미만 소형 UAS를 기본 대상으로 하며, FAA DroneZone에서 등록과 공역승인을 처리합니다. 사람 위 비행·야간비행 등은 운용 카테고리와 추가 요건이 붙습니다.",
    note: "미국은 기종별 면허보다 Part 107, 레크리에이션, 등록, 공역승인, waiver 체계가 분류의 핵심입니다.",
    links: [{ label: "FAA Part 107 Regulations", href: "https://www.faa.gov/newsroom/small-unmanned-aircraft-systems-uas-regulations-part-107" }, { label: "FAA Remote Pilot Certificate", href: "https://www.faa.gov/uas/commercial_operators/become_a_drone_pilot" }, { label: "FAADroneZone", href: "https://faadronezone-access.faa.gov/" }],
  },
};

const classificationEn: Record<string, ClassificationProfile> = {
  algeria: {
    pilot: "Public sources do not clearly show a civilian pilot certificate taxonomy by aircraft type or grade. Operators should first verify activity approval through the National UAS Center.",
    aircraft: "The core equipment requirement is declaration or registration of UAS under the state framework, with sensitive-equipment acquisition approval where applicable.",
    note: "Needs verification: detailed public pilot and aircraft class material is limited.",
    links: [{ label: "Algerian Ministry of National Defence UAS Center Notice", href: "https://www.mdn.dz/site_principal/sommaire/actualites/an/2025/decembre/spot07122025an.php" }],
  },
  cambodia: {
    pilot: "A national drone pilot certificate taxonomy is not clearly visible in public official material. Permission and security compliance are the practical starting points.",
    aircraft: "Equipment class and airworthiness categories are less visible than location, security sensitivity, and authority permission.",
    note: "Needs verification: the public system is closer to notices and permission control than a one-stop class framework.",
    links: [{ label: "SSCA Drone Announcement", href: "https://civilaviation.gov.kh/legislation-regulations-and-publication/regulation/security-regulation/annoucement-drone?article_category_id=c45964b1-bfc7-4f36-bb59-0274a08d5c4e&article_category_title=security-regulation&article_id=86feb698-f5ef-453d-bb19-f18c96bf5cf2&article_title=annoucement-drone" }],
  },
  china: {
    pilot: "Pilot licensing combines aircraft type, such as multicopter, fixed-wing, helicopter, and airship, with operational scope such as VLOS or BVLOS.",
    aircraft: "Civil UAS are managed by weight, performance, and operational risk, with UOM supporting real-name registration, airspace information, and operational applications.",
    note: "China links pilot classes and aircraft classes within an integrated operations-management framework.",
    links: [{ label: "CAAC UOM Platform", href: "https://uom.caac.gov.cn/" }, { label: "CAAC Pilot License Exam Management Measures", href: "https://uom.caac.gov.cn/api/home/anon/download/202405-33f0eecc-8802-4f4d-86a2-67430c0e4ae8/14caac8f-2ea3-4863-8d0a-389ad5de31fd" }],
  },
  eu: {
    pilot: "In the Open category, A1, A2, and A3 subcategories determine the training and exam level for remote pilots. Specific and Certified operations require stronger authorization and competency evidence.",
    aircraft: "Aircraft are linked to C0-C4 class markings, remote identification, MTOM, and distance-from-people rules. A1, A2, and A3 map the operational environment.",
    note: "The EU model is less a single pilot license and more a risk-based match between operation category and aircraft class.",
    links: [{ label: "EASA Open Category", href: "https://www.easa.europa.eu/en/domains/drones-air-mobility/operating-drone/open-category-low-risk-civil-drones" }, { label: "EASA Operator Registration and Pilot Competency", href: "https://www.easa.europa.eu/en/node/143656" }],
  },
  ghana: {
    pilot: "RPAS safety training is a prerequisite for registration, with separate applications for RPAS pilot licence, prospective commercial operator, and maintenance engineer.",
    aircraft: "Import, use, BVLOS or above-400-ft operation, sale authorization, ownership transfer, export, deregistration, duplicate certificate, and amendment applications are separated.",
    note: "Ghana's public structure is clearer by RPAS application type than by a simple aircraft class label.",
    links: [{ label: "GCAA RPAS Online Safety Training", href: "https://www.gcaa.com.gh/dexam/course/rpas-online-course/" }, { label: "GCAA RPAS Resources", href: "https://www.gcaa.com.gh/web/rpas-resources/" }],
  },
  japan: {
    pilot: "Japan's UA pilot certificate is divided into Class 1 and Class 2. Class 1 connects to advanced operations such as Level 4; Class 2 supports standard lower-risk operations.",
    aircraft: "UA weighing 100 g or more must be registered. Higher-risk operation connects aircraft certification, flight permission, flight-plan reporting, logbooks, and accident reporting.",
    note: "Japan ties pilot class, aircraft registration/certification, and operational permission through DIPS 2.0.",
    links: [{ label: "MLIT Flight Rules for Unmanned Aircraft", href: "https://www.mlit.go.jp/en/koku/uas.html" }, { label: "MLIT DIPS 2.0", href: "https://www.ossportal.dips.mlit.go.jp/portal/top/?lang=en" }, { label: "MLIT Registration WebPortal", href: "https://www.mlit.go.jp/koku/drone/en/" }],
  },
  kenya: {
    pilot: "Remote Aircraft Operators Certificate, remote-pilot requirements, and UAS Training Organization approvals are central to operator and training classification.",
    aircraft: "KCAA UAS materials separate regulations, implementation standards, fees, registration, resellers, ROC, and UTO resources.",
    note: "Kenya is best compared through operator certification and training-organization controls.",
    links: [{ label: "KCAA Unmanned Aircraft Systems", href: "https://www.kcaa.or.ke/safety-security-oversight/unmanned-aircraft-systems" }],
  },
  korea: {
    pilot: "Korea operates ultralight vehicle pilot certificates by aircraft type, including unmanned multicopter, with Class 1-4 style grading linked to weight and risk.",
    aircraft: "Drone One-Stop handles aircraft reporting, business registration, flight approval, special flight approval, and aerial photography applications; higher-risk special operations connect to safety review.",
    note: "Korea separates pilot certificate, aircraft reporting, drone-service business registration, and special flight approval while routing many requests through one portal.",
    links: [{ label: "Drone One-Stop Civil Service", href: "https://drone.onestop.go.kr/" }, { label: "TS Drone Pilot Certificate Exam", href: "https://main.kotsa.or.kr/portal/contents.do?menuCode=02020200" }, { label: "Notice on UAS Qualifications and Training Institutions", href: "https://law.go.kr/LSW/admRulLsInfoP.do?admRulSeq=2100000259052" }],
  },
  saudi: {
    pilot: "The GACA UAS portal identifies Remote Pilot Certificate procedures as part of its online service set.",
    aircraft: "Unmanned aircraft registration, customs clearance, and operational applications are handled through GACA UAS and Ajwaa digital aviation services.",
    note: "Saudi public material is clearer on registration, RPC, customs, and permit workflow than on detailed aircraft class labels.",
    links: [{ label: "GACA UAS Registration Portal", href: "https://uas.gaca.gov.sa/uas/" }, { label: "Ajwaa GACA Digital Services", href: "https://ajwaa.sa/" }],
  },
  tanzania: {
    pilot: "TCAA requires operator registration and operation-permit steps; non-residents need account setup and advance preparation.",
    aircraft: "Import permit, drone registration, operator registration, and operation permit are sequential. Guidance also shows different fee bands, including under 5 kg and 5-25 kg.",
    note: "Tanzania's practical classification is driven by import, registration, and operation-permit sequence.",
    links: [{ label: "TCAA Drone Permit Procedures", href: "https://tcaa.go.tz/pages/drones" }, { label: "Tanzania Drone Usage Conditions", href: "https://www.tfs.go.tz/uploads/documents/drone_tz_usage_conditions.pdf" }],
  },
  uae: {
    pilot: "UAE Drones and GCAA/DCAA workflows connect operator login, mission planning, airspace approval, and local permits.",
    aircraft: "UAS registration, controlled-airspace mission approval, Dubai RPAS registration and permits, and federal CAR-UAS requirements form the equipment-control axis.",
    note: "The UAE combines federal registration with emirate-level authorization in a smart-airspace-management model.",
    links: [{ label: "UAE Drones Official Platform", href: "https://drones.gov.ae/" }, { label: "UAE GCAA UAS Registration", href: "https://www.gcaa.gov.ae/en/Pages/UASRegistration.aspx/" }, { label: "DCAA Dubai Drone Service", href: "https://www.dcaa.gov.ae/services/aviation-safety-operations/drone-non-commercial-purpose" }],
  },
  usa: {
    pilot: "Commercial and non-recreational small UAS operation uses the Part 107 Remote Pilot Certificate, while recreational flight connects to TRUST and registration rules.",
    aircraft: "Part 107 covers small UAS under 55 lb; FAA DroneZone handles registration and airspace authorization. Operations over people and night operations add category-specific requirements.",
    note: "The U.S. comparison axis is Part 107, recreational operation, registration, airspace authorization, and waiver categories rather than aircraft-type licensing.",
    links: [{ label: "FAA Part 107 Regulations", href: "https://www.faa.gov/newsroom/small-unmanned-aircraft-systems-uas-regulations-part-107" }, { label: "FAA Remote Pilot Certificate", href: "https://www.faa.gov/uas/commercial_operators/become_a_drone_pilot" }, { label: "FAADroneZone", href: "https://faadronezone-access.faa.gov/" }],
  },
};

const criteriaKo: Record<string, CriteriaSet> = {
  algeria: {
    pilot: [
      { label: "민간 조종자 등급", criterion: "공개자료 기준 세부 등급 확인 제한. 활동 승인·보안관리 여부를 우선 확인" },
      { label: "운용 허가", criterion: "국가 무인항공시스템 센터 관리 대상 활동인지 여부" },
    ],
    aircraft: [
      { label: "신고 대상 UAS", criterion: "보유 무인항공시스템 신고·등록 대상 여부" },
      { label: "민감 장비", criterion: "민감 장비 취득 승인 또는 보안 관련 제한 대상 여부" },
    ],
  },
  cambodia: {
    pilot: [
      { label: "공개 자격등급", criterion: "전국 단일 공개 조종자 등급 확인 제한" },
      { label: "허가 중심 운용", criterion: "비행 장소, 목적, 보안기관 허가 필요 여부" },
    ],
    aircraft: [
      { label: "민감지역 운용", criterion: "수도권, 국경, 공항, 보안시설 등 제한구역 해당 여부" },
      { label: "무단운용 금지", criterion: "관할기관 사전 허가 없이 운용하는지 여부" },
    ],
  },
  china: {
    pilot: [
      { label: "기종 분류", criterion: "멀티콥터, 고정익, 헬리콥터, 비행선 등 조종 기체 종류" },
      { label: "운용범위", criterion: "시계내(VLOS), 시계밖(BVLOS), 지상국 운용 등 운항 방식" },
      { label: "조종원 집조", criterion: "CAAC/UOM 기반 시험과 집조·등급 요건 충족 여부" },
    ],
    aircraft: [
      { label: "실명등록", criterion: "UOM 플랫폼 등록 및 소유·운용자 식별 여부" },
      { label: "중량·성능", criterion: "중량, 성능, 운용위험에 따른 관리 대상 여부" },
      { label: "공역관리", criterion: "비행 공역 제한, 계획·신고·승인 필요 여부" },
    ],
  },
  eu: {
    pilot: [
      { label: "A1", criterion: "사람 위 또는 사람 근처 저위험 운용. 군중 위 비행은 제외" },
      { label: "A2", criterion: "비관계자와 가까운 운용. 추가 이론시험·거리 기준 필요" },
      { label: "A3", criterion: "사람·주거·상업·공업·휴양지역에서 떨어진 운용" },
      { label: "Specific/Certified", criterion: "Open 범위를 넘는 위험 운용. 운영승인·위험평가·인증 필요" },
    ],
    aircraft: [
      { label: "C0", criterion: "초소형 저위험 기체. Open A1 중심 운용" },
      { label: "C1", criterion: "저중량 기체. 원격식별 등 추가 요구와 A1 운용 연결" },
      { label: "C2", criterion: "사람 가까이 운용 가능성이 있는 기체. A2 역량요건과 연결" },
      { label: "C3/C4", criterion: "더 무거운 기체 또는 단순·자작형 기체. A3 중심 운용" },
    ],
  },
  ghana: {
    pilot: [
      { label: "RPAS 안전교육", criterion: "등록 전 온라인 안전교육 수료 및 모듈 평가 통과 여부" },
      { label: "RPAS Pilot Licence", criterion: "조종자 면허 신청 대상 운용인지 여부" },
      { label: "Commercial Operator", criterion: "상업·기관 운용자로 별도 승인 대상인지 여부" },
    ],
    aircraft: [
      { label: "Import/Use", criterion: "수입 신청과 RPAS 사용 승인 필요 여부" },
      { label: "BVLOS/400ft 초과", criterion: "시계밖 또는 400ft AGL 초과 특수운용 여부" },
      { label: "소유권·말소", criterion: "판매, 소유권 변경, 수출, 말소 등 생애주기 민원 해당 여부" },
    ],
  },
  japan: {
    pilot: [
      { label: "Class 1", criterion: "Level 4 등 유인지역 제3자 상공 BVLOS 등 고난도 운항과 연결" },
      { label: "Class 2", criterion: "일반적·저위험 무인항공기 운항 역량증명" },
      { label: "DIPS 신청", criterion: "기능증명, 비행허가, 계획보고 등 전자신청 대상 여부" },
    ],
    aircraft: [
      { label: "등록 대상", criterion: "100g 이상 무인항공기 등록 의무" },
      { label: "기체인증", criterion: "고위험 또는 고도화 운항에 필요한 기체 안전성 인증 여부" },
      { label: "운항관리", criterion: "비행허가·승인, 비행계획, 비행일지, 사고보고 필요 여부" },
    ],
  },
  kenya: {
    pilot: [
      { label: "ROC", criterion: "Remote Aircraft Operators Certificate 대상 운용자 여부" },
      { label: "UTO", criterion: "UAS Training Organization 승인 교육기관 해당 여부" },
      { label: "Remote pilot 요건", criterion: "운용위험·업무범위에 따른 원격조종자 요건 적용 여부" },
    ],
    aircraft: [
      { label: "UAS 등록", criterion: "KCAA 등록 대상 무인항공기 여부" },
      { label: "운영자 인증", criterion: "운영자 인증·수수료·시행기준 적용 대상 여부" },
      { label: "판매·유통", criterion: "리셀러·디스트리뷰터 관리 대상 여부" },
    ],
  },
  korea: {
    pilot: [
      { label: "1종", criterion: "25kg 초과 고중량·고위험 무인멀티콥터 운용. 필기·실기 등 가장 엄격한 증명 필요" },
      { label: "2종", criterion: "7kg 초과~25kg 이하 중량대 운용. 필기와 실기 평가 등 등급별 요건 적용" },
      { label: "3종", criterion: "2kg 초과~7kg 이하 운용. 교육·시험 요건이 1·2종보다 완화된 등급" },
      { label: "4종", criterion: "250g 초과~2kg 이하 소형 저위험 기체 중심. 온라인 교육 등 간소 절차 중심" },
      { label: "기종별", criterion: "무인멀티콥터 등 초경량비행장치 종류별 증명 체계" },
    ],
    aircraft: [
      { label: "비행장치 신고", criterion: "신고 대상 중량·용도·기체인지 여부" },
      { label: "사업등록", criterion: "촬영, 방제, 측량 등 초경량비행장치 사용사업 해당 여부" },
      { label: "비행승인", criterion: "관제권, 비행금지구역, 고도·장소 제한 대상 여부" },
      { label: "특별비행승인", criterion: "야간, 비가시권 등 특별운항 요건 해당 여부" },
      { label: "안전성 검토", criterion: "고위험 운항 또는 특별승인 과정에서 안전기준 검토 필요 여부" },
    ],
  },
  saudi: {
    pilot: [
      { label: "RPC", criterion: "Remote Pilot Certificate 신청·취득 대상 운용인지 여부" },
      { label: "운용자 승인", criterion: "목적별 운항 승인 또는 기관·상업 운용인지 여부" },
    ],
    aircraft: [
      { label: "UAS 등록", criterion: "GACA UAS 포털 등록 대상 무인항공기 여부" },
      { label: "통관", criterion: "수입·반입 장비의 통관 처리 필요 여부" },
      { label: "허가·인증", criterion: "Ajwaa/GACA 디지털 서비스의 허가·면허·인증 대상 여부" },
    ],
  },
  tanzania: {
    pilot: [
      { label: "Operator registration", criterion: "운영자 등록 대상 개인·기관인지 여부" },
      { label: "Operations permit", criterion: "운항허가가 필요한 비행 목적·장소·기간인지 여부" },
      { label: "Non-resident", criterion: "비거주자 사전 신청 및 계정 발급 대상인지 여부" },
    ],
    aircraft: [
      { label: "Import permit", criterion: "드론 반입·수입허가 필요 여부" },
      { label: "Drone registration", criterion: "TCAA 등록 대상 기체인지 여부" },
      { label: "Weight band", criterion: "5kg 미만, 5~25kg 등 안내자료상 중량대별 수수료·허가 적용 여부" },
    ],
  },
  uae: {
    pilot: [
      { label: "Operator login", criterion: "UAE PASS 또는 기관 사용자 기반 운용자 등록·로그인 대상 여부" },
      { label: "Mission approval", criterion: "통제공역 임무계획·즉시승인 대상 비행인지 여부" },
      { label: "Local permit", criterion: "두바이 등 에미리트별 별도 허가 대상인지 여부" },
    ],
    aircraft: [
      { label: "GCAA UAS registration", criterion: "연방 UAS 등록 대상 기체인지 여부" },
      { label: "DCAA RPAS service", criterion: "두바이 지역 등록·허가 대상인지 여부" },
      { label: "CAR-UAS", criterion: "연방 UAS 운항·기체 기준 적용 대상인지 여부" },
    ],
  },
  usa: {
    pilot: [
      { label: "Part 107", criterion: "55lb 미만, 약 25kg 미만 소형 UAS 상업·비레저 운용. Remote Pilot Certificate 필요" },
      { label: "Recreational", criterion: "취미·레크리에이션 운용. 0.55lb(약 250g) 초과 등록 및 TRUST 규칙 확인" },
      { label: "Waiver/Authorization", criterion: "일반 규칙을 넘는 운용 또는 통제공역 비행 여부" },
    ],
    aircraft: [
      { label: "Small UAS", criterion: "55파운드 미만, 약 25kg 미만 기체로 Part 107 기본 적용 대상" },
      { label: "Registration", criterion: "레크리에이션 0.55lb(약 250g) 초과 또는 Part 107 운용 기체 등록" },
      { label: "Operations over people/night", criterion: "사람 위 비행·야간비행 등 추가 카테고리 요건 해당 여부" },
      { label: "LAANC/COA", criterion: "통제공역 승인 또는 COA 처리 대상 여부" },
    ],
  },
};

const criteriaEn: Record<string, CriteriaSet> = {
  algeria: {
    pilot: [
      { label: "Civil pilot class", criterion: "Detailed public classes are limited; first verify activity approval and security control" },
      { label: "Operation approval", criterion: "Whether the activity falls under National UAS Center management" },
    ],
    aircraft: [
      { label: "Declared UAS", criterion: "Whether the UAS must be declared or registered" },
      { label: "Sensitive equipment", criterion: "Whether sensitive-equipment acquisition approval or security restrictions apply" },
    ],
  },
  cambodia: {
    pilot: [
      { label: "Public license class", criterion: "No clear nationwide public drone pilot class found" },
      { label: "Permission-led operation", criterion: "Flight location, purpose, and security permission requirements" },
    ],
    aircraft: [
      { label: "Sensitive-area operation", criterion: "Capital, border, airport, or security-facility restriction status" },
      { label: "Unauthorized operation", criterion: "Whether flight occurs without prior authority approval" },
    ],
  },
  china: {
    pilot: [
      { label: "Aircraft type", criterion: "Multicopter, fixed-wing, helicopter, airship, and related type ratings" },
      { label: "Operational scope", criterion: "VLOS, BVLOS, ground-control-station operation, and mission profile" },
      { label: "Pilot license", criterion: "CAAC/UOM exam and licensing requirements" },
    ],
    aircraft: [
      { label: "Real-name registration", criterion: "UOM owner/operator identification and aircraft registration" },
      { label: "Weight and performance", criterion: "Weight, performance, and operational-risk management class" },
      { label: "Airspace control", criterion: "Restricted airspace, plan filing, notification, or approval requirements" },
    ],
  },
  eu: {
    pilot: [
      { label: "A1", criterion: "Low-risk operations over or near people, excluding assemblies of people" },
      { label: "A2", criterion: "Operations close to uninvolved people with additional theory and distance requirements" },
      { label: "A3", criterion: "Operations far from people and residential, commercial, industrial, or recreational areas" },
      { label: "Specific/Certified", criterion: "Higher-risk operations requiring authorization, risk assessment, or certification" },
    ],
    aircraft: [
      { label: "C0", criterion: "Very small low-risk aircraft, mainly connected to Open A1" },
      { label: "C1", criterion: "Low-weight aircraft with additional requirements such as remote identification" },
      { label: "C2", criterion: "Aircraft that may operate closer to people, linked to A2 competency" },
      { label: "C3/C4", criterion: "Heavier or simpler/self-built aircraft, generally linked to A3 operation" },
    ],
  },
  ghana: {
    pilot: [
      { label: "RPAS safety training", criterion: "Completion of online safety course and module checks before registration" },
      { label: "RPAS Pilot Licence", criterion: "Whether the operation requires pilot licence application" },
      { label: "Commercial Operator", criterion: "Whether commercial or institutional operator approval applies" },
    ],
    aircraft: [
      { label: "Import/Use", criterion: "Whether import and RPAS use approval are required" },
      { label: "BVLOS/above 400 ft", criterion: "Whether BVLOS or above-400-ft AGL special operation applies" },
      { label: "Lifecycle actions", criterion: "Sale, ownership transfer, export, deregistration, duplicate certificate, or amendment" },
    ],
  },
  japan: {
    pilot: [
      { label: "Class 1", criterion: "Advanced operation such as Level 4 BVLOS over third parties" },
      { label: "Class 2", criterion: "Standard lower-risk UA operation competency" },
      { label: "DIPS application", criterion: "Whether certification, permission, or flight-plan reporting is handled electronically" },
    ],
    aircraft: [
      { label: "Registration", criterion: "UA weighing 100 g or more must be registered" },
      { label: "Aircraft certification", criterion: "Whether aircraft safety certification is needed for higher-risk operation" },
      { label: "Operational control", criterion: "Flight permission, flight plan, logbook, and accident reporting duties" },
    ],
  },
  kenya: {
    pilot: [
      { label: "ROC", criterion: "Whether a Remote Aircraft Operators Certificate is required" },
      { label: "UTO", criterion: "Whether UAS Training Organization approval applies" },
      { label: "Remote pilot requirements", criterion: "Remote pilot requirements based on risk and operational scope" },
    ],
    aircraft: [
      { label: "UAS registration", criterion: "Whether the aircraft is subject to KCAA registration" },
      { label: "Operator certification", criterion: "Whether operator certification, fees, and implementation standards apply" },
      { label: "Sales/distribution", criterion: "Whether reseller or distributor controls apply" },
    ],
  },
  korea: {
    pilot: [
      { label: "Class 1", criterion: "Over 25 kg unmanned multicopter operation with stricter written/practical certification" },
      { label: "Class 2", criterion: "More than 7 kg and up to 25 kg, with class-specific written and practical assessment" },
      { label: "Class 3", criterion: "More than 2 kg and up to 7 kg, with lighter education and exam requirements" },
      { label: "Class 4", criterion: "More than 250 g and up to 2 kg, mainly simplified online education" },
      { label: "By aircraft type", criterion: "Certificate system by ultralight vehicle type, including unmanned multicopter" },
    ],
    aircraft: [
      { label: "Aircraft reporting", criterion: "Whether weight, use, or aircraft status triggers reporting" },
      { label: "Business registration", criterion: "Whether filming, spraying, surveying, or other drone-service business registration applies" },
      { label: "Flight approval", criterion: "Whether controlled airspace, no-fly zones, altitude, or location restrictions apply" },
      { label: "Special flight approval", criterion: "Whether night, BVLOS, or other special operation conditions apply" },
      { label: "Safety review", criterion: "Whether special approval or high-risk operation requires safety-standard review" },
    ],
  },
  saudi: {
    pilot: [
      { label: "RPC", criterion: "Whether Remote Pilot Certificate procedures apply" },
      { label: "Operator approval", criterion: "Whether purpose-specific or commercial/institutional operation approval applies" },
    ],
    aircraft: [
      { label: "UAS registration", criterion: "Whether the unmanned aircraft must be registered through GACA" },
      { label: "Customs clearance", criterion: "Whether imported equipment needs clearance" },
      { label: "Permit/certificate", criterion: "Whether Ajwaa/GACA digital permit, licence, or certificate services apply" },
    ],
  },
  tanzania: {
    pilot: [
      { label: "Operator registration", criterion: "Whether the person or organization must register as an operator" },
      { label: "Operations permit", criterion: "Whether the purpose, location, or duration requires an operations permit" },
      { label: "Non-resident", criterion: "Whether advance account setup and non-resident processing apply" },
    ],
    aircraft: [
      { label: "Import permit", criterion: "Whether import or entry permission is required" },
      { label: "Drone registration", criterion: "Whether TCAA aircraft registration applies" },
      { label: "Weight band", criterion: "Whether fee and permit bands such as under 5 kg or 5-25 kg apply" },
    ],
  },
  uae: {
    pilot: [
      { label: "Operator login", criterion: "Whether UAE PASS or staff-user operator access applies" },
      { label: "Mission approval", criterion: "Whether controlled-airspace mission planning and approval applies" },
      { label: "Local permit", criterion: "Whether emirate-level authorization, such as Dubai, applies" },
    ],
    aircraft: [
      { label: "GCAA UAS registration", criterion: "Whether federal UAS registration applies" },
      { label: "DCAA RPAS service", criterion: "Whether Dubai registration or permit services apply" },
      { label: "CAR-UAS", criterion: "Whether federal UAS aircraft and operational standards apply" },
    ],
  },
  usa: {
    pilot: [
      { label: "Part 107", criterion: "Commercial or non-recreational small UAS under 55 lb, about 25 kg, requiring a Remote Pilot Certificate" },
      { label: "Recreational", criterion: "Recreational operation; registration applies above 0.55 lb, about 250 g, plus TRUST checks" },
      { label: "Waiver/Authorization", criterion: "Operation beyond standard rules or in controlled airspace" },
    ],
    aircraft: [
      { label: "Small UAS", criterion: "Aircraft under 55 lb, about 25 kg, the basic scope of Part 107" },
      { label: "Registration", criterion: "Recreational aircraft above 0.55 lb, about 250 g, or any Part 107 registration" },
      { label: "People/night categories", criterion: "Whether operations over people or night-operation requirements apply" },
      { label: "LAANC/COA", criterion: "Whether controlled-airspace authorization or COA processing applies" },
    ],
  },
};

const weightCriteriaKo: Record<string, WeightCriteria> = {
  algeria: {
    pilot: "공개자료 기준 조종자 등급별 kg 구간 확인필요",
    aircraft: "보유 UAS 신고·등록 대상 여부가 중심이며, 공개 kg 구간은 확인필요",
  },
  cambodia: {
    pilot: "공개자료 기준 조종자 등급별 kg 구간 확인필요",
    aircraft: "비행장소·보안허가 중심. 공개 장비 중량 구간은 확인필요",
  },
  china: {
    pilot: "기종과 운용범위가 함께 작동하며, 세부 kg 구간은 UOM/CAAC 원문 확인 필요",
    aircraft: "중량·성능·운용위험 기반 관리. UOM에서 기체별 등록·운항관리 기준 확인",
  },
  eu: {
    pilot: "Open A1/A2/A3는 기체 C등급과 MTOM 기준에 연동",
    aircraft: "C0 <0.25kg, C1 <0.9kg, C2 <4kg, C3/C4 <25kg 기준",
  },
  ghana: {
    pilot: "RPAS 안전교육·면허 신청 중심. 공개자료 기준 조종자 등급별 kg 구간 확인필요",
    aircraft: "수입·사용·BVLOS·400ft 초과 등 신청유형 중심. 공개 kg 구간은 원문 확인필요",
  },
  japan: {
    pilot: "Class 1/2는 주로 운항위험·운항범위 기준이며, 기체 등록은 0.1kg 이상 기준",
    aircraft: "100g(0.1kg) 이상 무인항공기 등록 의무",
  },
  kenya: {
    pilot: "ROC/UTO/운용위험 중심. 공개 요약자료 기준 조종자 등급별 kg 구간 확인필요",
    aircraft: "UAS 등록·운용범주 중심. 세부 kg 구간은 KCAA 규정 원문 확인필요",
  },
  korea: {
    pilot: "무인멀티콥터 자격은 통상 0.25kg, 2kg, 7kg, 25kg 구간으로 등급화",
    aircraft: "기체신고·비행승인·특별비행승인은 중량, 용도, 공역, 운항방식 기준이 함께 작동",
  },
  saudi: {
    pilot: "RPC/운용허가 중심. 공개자료 기준 조종자 등급별 kg 구간 확인필요",
    aircraft: "UAS 등록·통관·허가 중심. 공개 kg 구간은 GACA 원문 확인필요",
  },
  tanzania: {
    pilot: "운영자 등록·운항허가 중심. 수수료·허가에서 5kg, 25kg 구간 확인",
    aircraft: "<5kg, 5.1~25kg, >25kg 수수료·등록·허가 구간 확인",
  },
  uae: {
    pilot: "운용자·임무승인 중심. 공개자료 기준 조종자 등급별 kg 구간 확인필요",
    aircraft: "GCAA 등록·DCAA 허가·CAR-UAS 기준. 세부 kg 구간은 원문 확인필요",
  },
  usa: {
    pilot: "Part 107은 55lb 미만, 즉 약 25kg 미만 소형 UAS 운용 기준",
    aircraft: "등록 예외는 레크리에이션 0.55lb 이하, 즉 250g 이하. Part 107 소형 UAS는 <55lb(약 25kg)",
  },
};

const weightCriteriaEn: Record<string, WeightCriteria> = {
  algeria: {
    pilot: "Public kg bands for pilot classes need verification.",
    aircraft: "Declaration/registration is central; public kg bands need verification.",
  },
  cambodia: {
    pilot: "Public kg bands for pilot classes need verification.",
    aircraft: "Location and security permission dominate; public equipment kg bands need verification.",
  },
  china: {
    pilot: "Aircraft type and operational scope interact; detailed kg bands should be checked in UOM/CAAC source material.",
    aircraft: "Managed by weight, performance, and operational risk; check aircraft-specific UOM registration rules.",
  },
  eu: {
    pilot: "Open A1/A2/A3 is linked to aircraft C-class and MTOM thresholds.",
    aircraft: "C0 <0.25 kg, C1 <0.9 kg, C2 <4 kg, C3/C4 <25 kg.",
  },
  ghana: {
    pilot: "Training and licence applications dominate; public kg bands for pilot classes need verification.",
    aircraft: "Application type dominates: import, use, BVLOS, and above 400 ft; public kg bands need verification.",
  },
  japan: {
    pilot: "Class 1/2 is mainly operation-risk based; aircraft registration starts at 0.1 kg.",
    aircraft: "UA weighing 100 g, or 0.1 kg, or more must be registered.",
  },
  kenya: {
    pilot: "ROC/UTO and operational risk dominate; public kg bands for pilot classes need source verification.",
    aircraft: "Registration and operation categories dominate; detailed kg bands should be checked in KCAA regulations.",
  },
  korea: {
    pilot: "Unmanned multicopter qualification is commonly structured around 0.25 kg, 2 kg, 7 kg, and 25 kg thresholds.",
    aircraft: "Aircraft reporting and approvals combine weight, purpose, airspace, and operation type.",
  },
  saudi: {
    pilot: "RPC and operational authorization dominate; public kg bands for pilot classes need verification.",
    aircraft: "Registration, customs, and permits dominate; public kg bands should be checked in GACA sources.",
  },
  tanzania: {
    pilot: "Operator registration and permits dominate; fee/permit bands confirm 5 kg and 25 kg thresholds.",
    aircraft: "Confirmed fee/permit bands: <5 kg, 5.1-25 kg, and >25 kg.",
  },
  uae: {
    pilot: "Operator and mission approval dominate; public kg bands for pilot classes need verification.",
    aircraft: "GCAA registration, DCAA permits, and CAR-UAS apply; detailed kg bands should be checked in source rules.",
  },
  usa: {
    pilot: "Part 107 applies to small UAS under 55 lb, about 25 kg.",
    aircraft: "Registration exception: recreational aircraft at or below 0.55 lb, about 250 g. Part 107 small UAS: <55 lb, about 25 kg.",
  },
};

const countries: Country[] = [
  {
    id: "china",
    name: "중국",
    flag: "🇨🇳",
    region: "동아시아",
    authority: "중국민용항공국(CAAC), 국무원·중앙군사위원회",
    model: "국가 단위 통합 규제와 민용 무인항공기 조종원 집조·등급 체계가 결합된 모델입니다.",
    exam:
      "이론시험은 UOM 플랫폼 기반의 컴퓨터 선택형 시험으로 운영되고, 실기시험은 종합문답·구술·실제비행·지상국 운용 등을 포함합니다.",
    industry:
      "‘저고도경제’가 국가 성장축으로 부상했습니다. 드론 배송, 응급구조, 전력·태양광 점검, 항공관광, eVTOL 실증이 빠르게 확장됩니다.",
    signal:
      "자격·기체·운항 규칙을 정비하면서 산업 확장을 동시에 밀어붙이는 ‘규제+육성 병행형’입니다.",
    maturity: 5,
    restriction: 4,
    market: 5,
    examClarity: 5,
    tags: ["통합규제", "저고도경제", "제조강국", "배송·점검"],
    useCases: ["드론 배송", "전력·태양광 점검", "응급구조", "eVTOL·항공관광"],
    sources: [
      {
        label: "CAAC CCAR-92 운항안전관리규칙",
        href: "https://www.caac.gov.cn/XXGK/XXGK/MHGZ/202401/t20240103_222566.html",
      },
      {
        label: "CAAC 조종원 집조 시험관리방법",
        href: "https://uom.caac.gov.cn/api/home/anon/download/202405-33f0eecc-8802-4f4d-86a2-67430c0e4ae8/14caac8f-2ea3-4863-8d0a-389ad5de31fd",
      },
      {
        label: "중국정부망 저고도경제 기사",
        href: "https://english.www.gov.cn/news/202510/17/content_WS68f1feb5c6d00ca5f9a06ddb.html",
      },
    ],
  },
  {
    id: "cambodia",
    name: "캄보디아",
    flag: "🇰🇭",
    region: "동남아시아",
    authority: "캄보디아 민간항공국(SSCA), 국방부·치안 당국",
    model:
      "공개 공식자료 기준으로 중국·한국·일본처럼 세분화된 전국 단일 조종자 자격시험 체계는 제한적으로 확인됩니다. 실제 운용은 허가·신고·보안관리 중심으로 접근해야 합니다.",
    exam:
      "표준화된 조종자 시험보다 비행 전 허가 확인, 민감지역 회피, 보안당국 지침 준수가 핵심입니다. 무단 운용 금지 지침이 전국 단위로 강화되었습니다.",
    industry:
      "농업·GIS·개발협력·관광 촬영 등 서비스 수요는 있으나, 국경지역·수도권·보안시설 주변 규제 리스크가 큰 초기 시장입니다.",
    signal:
      "산업 잠재력은 있지만 제도 메시지는 ‘활용 확대’보다 ‘허가 없는 운용 억제’에 더 가깝습니다.",
    maturity: 2,
    restriction: 5,
    market: 2,
    examClarity: 1,
    tags: ["허가중심", "보안민감", "초기시장", "농업·GIS"],
    useCases: ["농업 모니터링", "GIS·지도화", "개발협력", "관광·영상"],
    sources: [
      {
        label: "SSCA 공식 홈페이지",
        href: "https://civilaviation.gov.kh/",
      },
      {
        label: "국방부 무단 드론 운용 금지 지침(ODC)",
        href: "https://opendevelopmentcambodia.net/announcements/instructions-restricting-and-prohibiting-the-use-of-unmanned-aerial-vehicles-drones-without-permission/",
      },
      {
        label: "캄보디아 정보부 관련 보도",
        href: "https://www.information.gov.kh/articles/178604",
      },
    ],
  },
  {
    id: "ghana",
    name: "가나",
    flag: "🇬🇭",
    region: "서아프리카",
    authority: "가나 민간항공청(GCAA), 보건부",
    model:
      "GCAA의 RPAS 안내와 등록 절차를 기반으로 드론을 관리합니다. 공개자료 기준으로 조종자 자격은 독립 국가자격보다 등록·교육수료·운항허가가 결합된 형태로 확인됩니다.",
    exam:
      "GCAA RPAS 온라인 교육 모듈을 이수하고 수료증을 제출해 등록 절차를 이어가는 구조가 확인됩니다. 상업·기관 운용은 기체 등록, 운항 안전요건, 공역·공항 주변 제한 확인이 핵심입니다.",
    industry:
      "의료물류 드론이 대표 사례입니다. 보건부 자료 기준 Zipline 기반 의료물품 배송망이 운영되며, 공공보건·원격지역 물류·공공안전 분야로 확장 가능성이 큽니다.",
    signal:
      "아프리카권에서 드론 의료물류 실증·운영 경험이 뚜렷한 ‘공공서비스 적용 선도형’입니다.",
    maturity: 3,
    restriction: 4,
    market: 4,
    examClarity: 3,
    tags: ["GCAA", "RPAS등록", "의료물류", "공공서비스"],
    useCases: ["의료물품 배송", "공공보건", "원격지역 물류", "공공안전"],
    sources: [
      {
        label: "GCAA RPAS·드론 안내",
        href: "https://www.gcaa.com.gh/web/remotely-piloted-aircraft-system-2/",
      },
      {
        label: "GCAA RPAS 온라인 교육 포털",
        href: "https://www.gcaa.com.gh/rpas/",
      },
      {
        label: "가나 보건부 의료드론 배송망",
        href: "https://moh.gov.gh/ghanas-medical-drone-delivery-system-takes-off/",
      },
    ],
  },
  {
    id: "kenya",
    name: "케냐",
    flag: "🇰🇪",
    region: "동아프리카",
    authority: "케냐 민간항공청(KCAA)",
    model:
      "KCAA가 2020년 UAS 규정과 시행기준을 통해 등록, 운영자 인증, 훈련기관, 수수료 등을 관리합니다. 비교 대상 아프리카 국가 중 제도 문서의 공개성과 체계성이 높은 편입니다.",
    exam:
      "공식 UAS 자료는 Remote Aircraft Operators Certificate(ROC), UAS Training Organizations(UTO), 시행기준 등 운용자·훈련기관 중심 절차를 제시합니다. 실제 운항은 등록과 KCAA 승인 범위 안에서 진행됩니다.",
    industry:
      "농업, 측량, 인프라 점검, 공공안전, 물류·항공서비스로 확장할 수 있는 기반이 있습니다. KCAA는 ICAO와 무인항공 안전·혁신 워크숍을 진행하며 제도 역량을 강화하고 있습니다.",
    signal:
      "아프리카권에서 규정·운영자 인증·훈련기관 체계를 비교적 명확히 공개한 ‘제도 정비형 성장시장’입니다.",
    maturity: 4,
    restriction: 4,
    market: 4,
    examClarity: 4,
    tags: ["KCAA", "UAS규정", "ROC", "훈련기관"],
    useCases: ["농업", "측량·지도화", "인프라 점검", "공공안전"],
    sources: [
      {
        label: "KCAA UAS 공식 안내",
        href: "https://www.kcaa.or.ke/safety-security-oversight/unmanned-aircraft-systems",
      },
      {
        label: "케냐 UAS 규정 2020",
        href: "https://new.kenyalaw.org/akn/ke/act/ln/2020/42",
      },
      {
        label: "KCAA·ICAO 무인항공 워크숍",
        href: "https://www.kcaa.or.ke/news/kcaa-and-icao-conclude-pioneering-workshop-safe-and-innovative-unmanned-aviation",
      },
    ],
  },
  {
    id: "algeria",
    name: "알제리",
    flag: "🇩🇿",
    region: "북아프리카",
    authority: "알제리 국방부, 국가 무인항공시스템 센터",
    model:
      "대통령령 제21-285호에 따른 무인항공시스템 관리체계를 바탕으로 국가 무인항공시스템 센터가 활동 관리기관으로 제시됩니다. 공개자료 기준 민간 산업육성보다 등록·보안관리 성격이 강합니다.",
    exam:
      "세분화된 공개 조종자 시험체계보다는 보유 장비 신고·등록, 국가기관 관리, 허가 중심 접근이 확인됩니다. 실제 운용은 보안·국방 관련 제한을 우선 확인해야 합니다.",
    industry:
      "민간 활용 정보는 제한적으로 확인됩니다. 에너지·인프라·국경관리·공공안전 수요 잠재력은 있으나, 단기 시장 접근은 허가·보안 리스크가 큰 구조로 보는 것이 안전합니다.",
    signal:
      "드론을 산업 플랫폼보다 국가안보 관리 대상으로 우선 다루는 ‘보안관리 우선형’입니다.",
    maturity: 3,
    restriction: 5,
    market: 2,
    examClarity: 2,
    tags: ["국가등록", "보안중심", "허가필수", "자료제한"],
    useCases: ["공공안전", "국경관리", "에너지 시설점검", "인프라 관리"],
    sources: [
      {
        label: "알제리 국방부 국가 UAS 센터 발표",
        href: "https://www.mdn.dz/site_principal/sommaire/actualites/an/2025/decembre/spot07122025an.php",
      },
    ],
  },
  {
    id: "tanzania",
    name: "탄자니아",
    flag: "🇹🇿",
    region: "동아프리카",
    authority: "탄자니아 민간항공청(TCAA)",
    model:
      "TCAA가 RPAS 규정과 드론 허가 절차를 통해 수입허가, 기체 등록, 운영자 등록, 운항허가를 관리합니다. 외국인·비거주자 운용은 사전 절차 부담이 큰 편입니다.",
    exam:
      "공식 절차는 조종자 단일 시험보다 수입허가, 기체 등록, 운영자 등록, 운항허가 신청을 중심으로 안내됩니다. 비거주자는 입국 전 최소 1개월 전에 관련 신청을 진행해야 한다는 안내가 확인됩니다.",
    industry:
      "관광·영상, 야생동물·보전, 농업, 지도화, 개발협력 분야 수요가 있으나, 실제 사업화는 TCAA 허가와 현지 파트너 요건을 함께 고려해야 합니다.",
    signal:
      "활용 가능성은 있지만 절차 준수가 중요한 ‘사전허가 관리형’ 시장입니다.",
    maturity: 3,
    restriction: 5,
    market: 3,
    examClarity: 3,
    tags: ["TCAA", "수입허가", "운항허가", "관광·보전"],
    useCases: ["관광·영상", "야생동물 보전", "농업", "지도화"],
    sources: [
      {
        label: "TCAA 드론 허가 절차",
        href: "https://tcaa.go.tz/pages/drones",
      },
      {
        label: "TCAA RPAS 규정 자료",
        href: "https://tcaa.go.tz/index.php/publications/rpas-regulations",
      },
      {
        label: "탄자니아 드론 사용 조건 안내",
        href: "https://www.tfs.go.tz/uploads/documents/drone_tz_usage_conditions.pdf",
      },
    ],
  },
  {
    id: "uae",
    name: "UAE",
    flag: "🇦🇪",
    region: "중동",
    authority: "UAE 민간항공청(GCAA), 두바이 민간항공청(DCAA)",
    model:
      "연방 차원에서는 GCAA가 UAS 등록과 운항 기준을 관리하고, 두바이 등 에미리트별 항공당국이 지역 허가·비행구역·등록 절차를 별도로 운영합니다.",
    exam:
      "공개 공식자료 기준 조종자 단일 국가시험보다 UAS 등록, UAE Drones 플랫폼 기반 임무·공역 승인, 두바이 RPAS 등록·허가가 핵심 절차입니다. 상업·기관 운용은 사전 승인과 지역 당국 확인이 중요합니다.",
    industry:
      "스마트시티, 드론 배송, 공공안전, 인프라 점검, 항공교통관리 디지털화와 연결됩니다. UAE Drones 플랫폼은 통제공역 임무 승인과 비행상황 인식을 강조합니다.",
    signal:
      "연방 등록과 지역별 공역승인을 결합해 도시형 드론 서비스를 키우는 ‘스마트 공역관리형’입니다.",
    maturity: 4,
    restriction: 4,
    market: 5,
    examClarity: 3,
    tags: ["GCAA", "DCAA", "UAE Drones", "스마트시티"],
    useCases: ["드론 배송", "스마트시티", "공공안전", "인프라 점검"],
    sources: [
      {
        label: "UAE GCAA UAS 등록",
        href: "https://www.gcaa.gov.ae/en/Pages/UASRegistration.aspx/",
      },
      {
        label: "UAE Drones 공식 플랫폼",
        href: "https://drones.gov.ae/",
      },
      {
        label: "DCAA 두바이 드론 등록 서비스",
        href: "https://www.dcaa.gov.ae/services/aviation-safety-operations/drone-non-commercial-purpose",
      },
      {
        label: "GCAA CAR-UAS 규정",
        href: "https://gcaa.ae/en/PublishingImages1/CAR-UAS%20-%20UNMANNED%20AIRCRAFT%20SYSTEM%20%28UAS%29%20AND%20OPERATIONS-%20ISSUE%2001.pdf",
      },
    ],
  },
  {
    id: "saudi",
    name: "사우디아라비아",
    flag: "🇸🇦",
    region: "중동",
    authority: "사우디 민간항공청(GACA)",
    model:
      "GACA가 UAS 관련 규정, 전자서비스, 허가·등록 절차를 관리합니다. 국가항공 안전관리와 보안, 공역관리 틀 안에서 드론 운용을 허가하는 구조입니다.",
    exam:
      "공개 공식자료 기준 세부 조종자 시험보다 GACA UAS 규정 준수, 전자서비스 기반 등록·허가, 운항 목적별 승인 절차가 핵심입니다. 상업 운용은 기체·운영자·공역 승인 확인이 필요합니다.",
    industry:
      "Vision 2030, 스마트시티, 대형 인프라, 에너지 시설관리, 측량·건설, 공공안전 분야 수요와 연결됩니다. 디지털 항공서비스 포털을 통해 허가·인증 절차를 전자화하는 흐름이 강합니다.",
    signal:
      "국가 프로젝트와 공역 안전관리를 함께 묶는 ‘대형 프로젝트 연계형’ 성장시장입니다.",
    maturity: 4,
    restriction: 4,
    market: 5,
    examClarity: 3,
    tags: ["GACA", "전자허가", "Vision 2030", "인프라"],
    useCases: ["스마트시티", "건설·측량", "에너지 시설점검", "공공안전"],
    sources: [
      {
        label: "GACA UAS 규정",
        href: "https://gaca.gov.sa/en/rules-and-regulations-category/circulars/safety-and-environment-circulars/rules-and-regulations-related-to-unmanned-aircraft-systems",
      },
      {
        label: "GACA UAS 포털",
        href: "https://uas.gaca.gov.sa/uas/",
      },
      {
        label: "GACA 전자서비스 플랫폼",
        href: "https://myeservices.gaca.gov.sa/eservices/",
      },
      {
        label: "Ajwaa GACA 서비스 포털",
        href: "https://ajwaa.sa/GACA.CustomerPortal/",
      },
    ],
  },
  {
    id: "korea",
    name: "한국",
    flag: "🇰🇷",
    region: "동아시아",
    authority: "국토교통부, 한국교통안전공단(TS)",
    model:
      "초경량비행장치 조종자 증명 체계로 운영됩니다. 무인멀티콥터를 포함해 여러 장치 종류와 중량·운용범위별 등급이 결합됩니다.",
    exam:
      "학과시험은 100점 만점 70점 이상, 실기시험은 모든 평가항목에서 만족(S)을 받아야 합격하는 구조입니다. 일부 소형 등급은 교육·온라인 절차가 상대적으로 간소합니다.",
    industry:
      "공공안전, 시설점검, 농업, 공간정보, 드론 실증도시, K-UAM·AAM과 연계한 항공모빌리티 산업육성이 함께 진행됩니다.",
    signal:
      "자격·교육기관·기체신고·비행승인·사용사업을 분리해 관리하는 ‘안전관리 기반 산업육성형’입니다.",
    maturity: 4,
    restriction: 4,
    market: 4,
    examClarity: 4,
    tags: ["국가자격", "TS시험", "UAM연계", "공공실증"],
    useCases: ["시설점검", "재난·안전", "농업 방제", "공간정보"],
    sources: [
      {
        label: "TS 드론 조종자 증명 시험",
        href: "https://main.kotsa.or.kr/portal/contents.do?menuCode=02020200",
      },
      {
        label: "무인비행장치 자격·교육기관 고시",
        href: "https://law.go.kr/LSW/admRulLsInfoP.do?admRulSeq=2100000259052",
      },
      {
        label: "K-UAM·드론 산업 민관협의체 보도자료",
        href: "https://mofe.go.kr/com/cmm/fms/FileDown.do?atchFileId=ATCH_000000000029272&fileSn=1",
      },
    ],
  },
  {
    id: "japan",
    name: "일본",
    flag: "🇯🇵",
    region: "동아시아",
    authority: "국토교통성(MLIT)",
    model:
      "무인항공기 조종자 기능증명(Class 1·Class 2)을 기체인증, 운항규칙, 비행허가와 결합해 운영합니다.",
    exam:
      "지식·실기·신체 적합성 확인 후 DIPS2.0을 통해 기능증명을 신청합니다. Class 1은 유인지역 제3자 상공의 보조자 없는 BVLOS, 즉 Level 4 운항과 직접 연결됩니다.",
    industry:
      "우편·물류 배송, 도서·산간 지역 서비스, 재난 대응, 인프라 점검, AAM 실증을 중심으로 제도와 시장을 함께 키웁니다.",
    signal:
      "Level 4를 가능하게 만든 ‘고난도 운항 제도화형’입니다. 위험도가 높을수록 조종자·기체·운항 승인을 함께 요구합니다.",
    maturity: 5,
    restriction: 4,
    market: 4,
    examClarity: 5,
    tags: ["Class 1·2", "Level 4", "BVLOS", "DIPS2.0"],
    useCases: ["우편·물류", "재난대응", "인프라 점검", "AAM"],
    sources: [
      {
        label: "MLIT Level 4 포털",
        href: "https://www.mlit.go.jp/koku/level4/index.html",
      },
      {
        label: "MLIT 원격조종자 기능증명",
        href: "https://www.mlit.go.jp/koku/level4/license/en/",
      },
      {
        label: "METI·MLIT AAM 로드맵 개정",
        href: "https://www.meti.go.jp/english/press/2026/0327_002.html",
      },
    ],
  },
  {
    id: "usa",
    name: "미국",
    flag: "🇺🇸",
    region: "북미",
    authority: "연방항공청(FAA)",
    model:
      "상업·비레저 소형 UAS 운항은 Part 107 Remote Pilot Certificate가 기본입니다. 55파운드 미만 소형 UAS 운항 규칙과 결합됩니다.",
    exam:
      "초회 취득자는 16세 이상 등 자격요건을 충족하고 UAG 항공 지식시험을 통과해야 합니다. 자격 유지를 위해 24개월마다 온라인 recurrent training을 완료합니다.",
    industry:
      "배송, 공공안전, 농업, 인프라 점검, 측량 시장이 크며 BVLOS를 일상 운항으로 확장하기 위한 규정 정비가 진행 중입니다.",
    signal:
      "조종자 자격은 명확하고, 고난도 운항은 waiver·authorization·BVLOS 규칙으로 확장하는 ‘운영승인 확장형’입니다.",
    maturity: 5,
    restriction: 3,
    market: 5,
    examClarity: 5,
    tags: ["Part 107", "UAG시험", "BVLOS", "상업운항"],
    useCases: ["라스트마일 배송", "공공안전", "농업", "인프라 점검"],
    sources: [
      {
        label: "FAA Remote Pilot Certificate",
        href: "https://www.faa.gov/uas/commercial_operators/become_a_drone_pilot",
      },
      {
        label: "FAA Part 107 개요",
        href: "https://www.faa.gov/newsroom/small-unmanned-aircraft-systems-uas-regulations-part-107",
      },
      {
        label: "FAA BVLOS 제안규칙",
        href: "https://www.faa.gov/newsroom/beyond-visual-line-sight-bvlos",
      },
    ],
  },
  {
    id: "eu",
    name: "EU",
    flag: "🇪🇺",
    region: "유럽",
    authority: "EASA와 회원국 항공당국",
    model:
      "Open·Specific·Certified 위험기반 체계를 적용합니다. Open 카테고리는 A1·A2·A3 하위범주와 C0~C4 기체 등급이 맞물립니다.",
    exam:
      "저위험 Open 운항은 온라인 교육·이론시험 중심이고, A2 또는 Specific 운항으로 갈수록 추가 이론·실무훈련·운항승인이 요구됩니다.",
    industry:
      "U-space, 혁신항공서비스, IAM/UAM, 보안·방산 연계가 전략축입니다. EU는 2030년까지 대규모 드론 서비스 시장 형성을 목표로 합니다.",
    signal:
      "회원국을 가로지르는 공통 규칙을 바탕으로 서비스 시장을 키우는 ‘위험기반 통합시장형’입니다.",
    maturity: 5,
    restriction: 3,
    market: 4,
    examClarity: 4,
    tags: ["EASA", "Open A1/A2/A3", "U-space", "위험기반"],
    useCases: ["U-space", "도시항공교통", "점검·측량", "보안·방산"],
    sources: [
      {
        label: "EASA Open Category",
        href: "https://www.easa.europa.eu/en/domains/drones-air-mobility/operating-drone/open-category-low-risk-civil-drones",
      },
      {
        label: "EASA Open Category 교육 FAQ",
        href: "https://www.easa.europa.eu/en/faq/116457",
      },
      {
        label: "EU Drone Strategy 2.0",
        href: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A52022DC0652",
      },
    ],
  },
].sort((left, right) => left.id.localeCompare(right.id));

const countryEn: Record<string, Omit<Country, "id" | "flag" | "maturity" | "restriction" | "market" | "examClarity" | "sources"> & { sourceLabels: string[] }> = {
  algeria: {
    name: "Algeria",
    region: "North Africa",
    authority: "Ministry of National Defence; National UAS Center",
    model: "Algeria is organized around a state-managed UAS control framework under Presidential Decree No. 21-285. Public sources point to a security and registration model rather than a civilian market-expansion model.",
    exam: "Public information emphasizes equipment declaration, state registration, and permission-based operation more than a detailed open pilot examination system. Operators should prioritize security and defence restrictions before any flight.",
    industry: "Civil-market information remains limited. Energy, infrastructure, border management, and public-safety uses have potential, but near-term access should be treated as permission-heavy and security-sensitive.",
    signal: "Algeria is best read as a security-first market where drones are primarily managed as controlled aviation and national-security assets.",
    tags: ["State registration", "Security-first", "Permission required", "Limited public data"],
    useCases: ["Public safety", "Border management", "Energy inspection", "Infrastructure monitoring"],
    sourceLabels: ["Algerian Ministry of National Defence UAS Center Notice"],
  },
  cambodia: {
    name: "Cambodia",
    region: "Southeast Asia",
    authority: "State Secretariat of Civil Aviation; defence and security authorities",
    model: "Based on public official sources, Cambodia does not show the same detailed nationwide pilot certificate system seen in China, Korea, or Japan. Practical operation should be approached through permission, notification, and security compliance.",
    exam: "The core compliance burden is pre-flight permission, avoidance of sensitive areas, and observance of security-authority instructions rather than a standardized public pilot exam. National guidance against unauthorized drone operation has been strengthened.",
    industry: "Demand exists in agriculture, GIS, development cooperation, and tourism filming, but border areas, Phnom Penh, and sensitive facilities carry high regulatory risk.",
    signal: "Cambodia has service potential, but the policy signal is closer to restraint of unauthorized operation than rapid liberalization.",
    tags: ["Permission-based", "Security-sensitive", "Early market", "Agriculture and GIS"],
    useCases: ["Agriculture monitoring", "GIS and mapping", "Development cooperation", "Tourism and video"],
    sourceLabels: ["SSCA Official Website", "Ministry Instruction on Unauthorized Drone Use (ODC)", "Cambodia Ministry of Information Coverage"],
  },
  china: {
    name: "China",
    region: "East Asia",
    authority: "Civil Aviation Administration of China; State Council and Central Military Commission",
    model: "China combines nationwide integrated regulation with a civil UAS pilot licensing and rating structure.",
    exam: "Theory exams are computer-based multiple-choice tests through the UOM platform, while practical exams can include integrated questioning, oral checks, flight demonstration, and ground-control-station operation.",
    industry: "The low-altitude economy has become a national growth theme. Drone delivery, emergency response, power and solar inspection, aerial tourism, and eVTOL demonstrations are expanding quickly.",
    signal: "China is a regulation-plus-promotion model that tightens credentials, aircraft, and operations while actively scaling the industry.",
    tags: ["Integrated rules", "Low-altitude economy", "Manufacturing power", "Delivery and inspection"],
    useCases: ["Drone delivery", "Power and solar inspection", "Emergency response", "eVTOL and aerial tourism"],
    sourceLabels: ["CAAC CCAR-92 Operational Safety Rules", "CAAC Pilot License Exam Management Measures", "China State Council Low-Altitude Economy Article"],
  },
  eu: {
    name: "EU",
    region: "Europe",
    authority: "EASA and national aviation authorities",
    model: "The EU applies a risk-based Open, Specific, and Certified framework. The Open category combines A1, A2, and A3 subcategories with C0-C4 aircraft classes.",
    exam: "Lower-risk Open operations rely on online training and theory exams, while A2 and Specific operations require additional theory, practical training, or operational authorization.",
    industry: "U-space, innovative aerial services, IAM/UAM, and security-defence links are strategic pillars. The EU aims to develop a large-scale drone services market by 2030.",
    signal: "The EU is a risk-based integrated market model that uses common rules across member states to scale drone services.",
    tags: ["EASA", "Open A1/A2/A3", "U-space", "Risk-based"],
    useCases: ["U-space", "Urban air mobility", "Inspection and surveying", "Security and defence"],
    sourceLabels: ["EASA Open Category", "EASA Open Category Training FAQ", "EU Drone Strategy 2.0"],
  },
  ghana: {
    name: "Ghana",
    region: "West Africa",
    authority: "Ghana Civil Aviation Authority; Ministry of Health",
    model: "Ghana manages drones through GCAA RPAS guidance and registration procedures. Public information points to a combined registration, training-completion, and operational-approval model rather than a stand-alone national license.",
    exam: "The GCAA RPAS online training module and certificate submission support the registration process. Commercial and institutional operations depend on aircraft registration, safety requirements, and airspace or airport restrictions.",
    industry: "Medical logistics is the flagship use case. Ministry of Health material highlights Zipline-based medical supply delivery, with strong relevance to public health, remote logistics, and public safety.",
    signal: "Ghana is a public-service application leader in Africa, especially in medical drone logistics.",
    tags: ["GCAA", "RPAS registration", "Medical logistics", "Public service"],
    useCases: ["Medical supply delivery", "Public health", "Remote-area logistics", "Public safety"],
    sourceLabels: ["GCAA RPAS and Drone Guidance", "GCAA RPAS Online Training Portal", "Ghana Ministry of Health Medical Drone Network"],
  },
  japan: {
    name: "Japan",
    region: "East Asia",
    authority: "Ministry of Land, Infrastructure, Transport and Tourism",
    model: "Japan combines Unmanned Aircraft Pilot Certificates for Class 1 and Class 2 with aircraft certification, flight rules, and flight permission.",
    exam: "Applicants complete knowledge, practical, and medical-fitness checks and apply through DIPS 2.0. Class 1 is directly tied to Level 4 BVLOS operations over third parties without an assistant.",
    industry: "Postal and logistics delivery, island and mountain services, disaster response, infrastructure inspection, and AAM demonstrations are central growth areas.",
    signal: "Japan is an advanced-operation institutionalization model, enabling Level 4 by combining pilot, aircraft, and operational approvals.",
    tags: ["Class 1 and 2", "Level 4", "BVLOS", "DIPS 2.0"],
    useCases: ["Postal and logistics", "Disaster response", "Infrastructure inspection", "AAM"],
    sourceLabels: ["MLIT Level 4 Portal", "MLIT Remote Pilot Certificate", "METI and MLIT AAM Roadmap Update"],
  },
  kenya: {
    name: "Kenya",
    region: "East Africa",
    authority: "Kenya Civil Aviation Authority",
    model: "KCAA manages registration, operator certification, training organizations, and fees through the 2020 UAS Regulations and related implementation standards. Among the African countries compared here, Kenya's public regulatory documents are relatively clear and systematic.",
    exam: "Official UAS materials emphasize Remote Aircraft Operators Certificates, UAS Training Organizations, and implementation standards. Actual operations are conducted within KCAA registration and approval limits.",
    industry: "Kenya has a base for agriculture, surveying, infrastructure inspection, public safety, logistics, and aviation services. KCAA has also worked with ICAO on unmanned-aviation safety and innovation workshops.",
    signal: "Kenya is an institution-building growth market with comparatively clear operator and training-organization frameworks.",
    tags: ["KCAA", "UAS rules", "ROC", "Training organizations"],
    useCases: ["Agriculture", "Surveying and mapping", "Infrastructure inspection", "Public safety"],
    sourceLabels: ["KCAA UAS Guidance", "Kenya UAS Regulations 2020", "KCAA and ICAO Unmanned Aviation Workshop"],
  },
  korea: {
    name: "Korea",
    region: "East Asia",
    authority: "Ministry of Land, Infrastructure and Transport; Korea Transportation Safety Authority",
    model: "Korea operates an ultralight vehicle pilot certificate framework. Unmanned multicopters and other aircraft types are divided by aircraft class, weight, and operating scope.",
    exam: "The theory exam requires at least 70 out of 100, and the practical exam requires satisfactory marks across all assessed items. Some smaller classes have simplified education or online procedures.",
    industry: "Public safety, facility inspection, agriculture, geospatial data, drone demonstration cities, and K-UAM/AAM development are advancing together.",
    signal: "Korea is an industry-promotion model built on safety management, separating pilot certification, training institutions, aircraft reporting, flight approval, and drone service businesses.",
    tags: ["National certificate", "TS exam", "UAM linkage", "Public demonstration"],
    useCases: ["Facility inspection", "Disaster and safety", "Agricultural spraying", "Geospatial data"],
    sourceLabels: ["TS Drone Pilot Certificate Exam", "Notice on UAS Qualifications and Training Institutions", "K-UAM and Drone Industry Public-Private Council Release"],
  },
  saudi: {
    name: "Saudi Arabia",
    region: "Middle East",
    authority: "General Authority of Civil Aviation",
    model: "GACA manages UAS rules, electronic services, and permit-registration procedures. Drone operation is authorized within the national aviation safety, security, and airspace-management framework.",
    exam: "Public sources emphasize compliance with GACA UAS rules, e-service registration and permits, and purpose-specific approvals more than a detailed standalone pilot exam. Commercial operations require aircraft, operator, and airspace approval checks.",
    industry: "Demand connects to Vision 2030, smart cities, major infrastructure, energy-asset management, surveying, construction, and public safety. Digital aviation service portals show a strong move toward electronic permits and certification.",
    signal: "Saudi Arabia is a major-project linked growth market combining national projects with airspace safety management.",
    tags: ["GACA", "E-permits", "Vision 2030", "Infrastructure"],
    useCases: ["Smart cities", "Construction and surveying", "Energy inspection", "Public safety"],
    sourceLabels: ["GACA UAS Rules", "GACA UAS Portal", "GACA E-Services Platform", "Ajwaa GACA Service Portal"],
  },
  tanzania: {
    name: "Tanzania",
    region: "East Africa",
    authority: "Tanzania Civil Aviation Authority",
    model: "TCAA manages drones through RPAS regulations and permit procedures covering import permits, aircraft registration, operator registration, and flight authorization. Foreign and non-resident operations carry a heavier pre-approval burden.",
    exam: "Official procedures emphasize import permission, aircraft registration, operator registration, and flight authorization rather than a single pilot exam. Non-residents are advised to begin applications at least one month before entry.",
    industry: "Tourism and filming, wildlife conservation, agriculture, mapping, and development cooperation are relevant, but commercialization requires TCAA approval and often local-partner considerations.",
    signal: "Tanzania is a prior-authorization market with meaningful use potential but strict procedural compliance needs.",
    tags: ["TCAA", "Import permit", "Flight authorization", "Tourism and conservation"],
    useCases: ["Tourism and video", "Wildlife conservation", "Agriculture", "Mapping"],
    sourceLabels: ["TCAA Drone Permit Procedures", "TCAA RPAS Regulation Materials", "Tanzania Drone Usage Conditions"],
  },
  uae: {
    name: "UAE",
    region: "Middle East",
    authority: "UAE General Civil Aviation Authority; Dubai Civil Aviation Authority",
    model: "At the federal level, GCAA manages UAS registration and operating standards, while emirate-level aviation authorities such as Dubai operate local permits, flight zones, and registration procedures.",
    exam: "Public official material emphasizes UAS registration, mission and airspace approvals through the UAE Drones platform, and Dubai RPAS registration and permits rather than one single national pilot exam.",
    industry: "The market connects to smart cities, drone delivery, public safety, infrastructure inspection, and digital air-traffic management. The UAE Drones platform emphasizes controlled-airspace mission approval and flight awareness.",
    signal: "The UAE is a smart-airspace management model combining federal registration with local airspace authorization for urban drone services.",
    tags: ["GCAA", "DCAA", "UAE Drones", "Smart cities"],
    useCases: ["Drone delivery", "Smart cities", "Public safety", "Infrastructure inspection"],
    sourceLabels: ["UAE GCAA UAS Registration", "UAE Drones Official Platform", "DCAA Dubai Drone Registration Service", "GCAA CAR-UAS Regulation"],
  },
  usa: {
    name: "United States",
    region: "North America",
    authority: "Federal Aviation Administration",
    model: "Part 107 Remote Pilot Certification is the baseline for commercial and non-recreational small UAS operations under 55 pounds.",
    exam: "Initial applicants must meet eligibility requirements, including being at least 16, and pass the UAG aeronautical knowledge test. Recurrent online training is required every 24 months.",
    industry: "Delivery, public safety, agriculture, infrastructure inspection, and surveying are large markets, with rulemaking underway to normalize BVLOS operations.",
    signal: "The United States has a clear pilot-certificate model and expands advanced operations through waivers, authorizations, and BVLOS rulemaking.",
    tags: ["Part 107", "UAG exam", "BVLOS", "Commercial operation"],
    useCases: ["Last-mile delivery", "Public safety", "Agriculture", "Infrastructure inspection"],
    sourceLabels: ["FAA Remote Pilot Certificate", "FAA Part 107 Overview", "FAA BVLOS Proposed Rule"],
  },
};

const safetyCaseEn: Record<string, { category: string; focus: string; lesson: string; badge: string }> = {
  "공항·유인기 근접 위험": {
    category: "Airport and crewed-aircraft proximity risk",
    focus: "Unauthorized flights near airports, midair-collision risk with crewed aircraft, and controlled-airspace safety.",
    lesson: "No-fly zones, airport restrictions, identification, and reporting channels are the starting point for UAS safety management.",
    badge: "Case and lesson",
  },
  "군중·도심 추락 및 인명 위해": {
    category: "Crowd, urban crash, and injury risk",
    focus: "Flights near children or crowds, low-altitude hovering, and human-contact risk from poor control.",
    lesson: "Flights over or near people require distance standards, guards, site control, and verified pilot competence.",
    badge: "Case and lesson",
  },
  "기체 결함·배터리·추락": {
    category: "Aircraft fault, battery, and crash events",
    focus: "Battery failure, rotor or motor problems, strong winds, and loss of control during return-to-home.",
    lesson: "Maintenance, battery management, weather judgment, and emergency procedures are core safety items even for small drones.",
    badge: "Case and lesson",
  },
  "상업운항·물류 시험 사고": {
    category: "Commercial operation and delivery-test accidents",
    focus: "Software, motor, landing-site obstacle, and detect-and-avoid issues during delivery-drone tests.",
    lesson: "Commercial operation depends on software change control, test planning, and contingency landing design, not only manual piloting skill.",
    badge: "Case and lesson",
  },
  "보안·불법비행·공공장소 위험": {
    category: "Security, illegal flight, and public-venue risk",
    focus: "Unauthorized operation around critical infrastructure, airports, and event venues, plus enforcement risk.",
    lesson: "Safety management needs education, airspace information, permits, reporting, enforcement, and remote identification together.",
    badge: "Case and lesson",
  },
  "안전조사·리스크 분석 자료": {
    category: "Safety investigation and risk-analysis material",
    focus: "UAS investigation policy, occurrence reporting, risk-area analysis, and annual safety trends.",
    lesson: "Accident cases are most useful when repeated risk factors are fed back into training, exams, and authorization criteria.",
    badge: "Case and lesson",
  },
  "군용 대형 드론 추락·격추 DB": {
    category: "Large military drone crash and shootdown database",
    focus: "Long-term records of MALE-class and large military UAS crashes, shootdowns, and losses.",
    lesson: "Military UAS remain vulnerable to link loss, aircraft faults, operating conditions, and air-defence threats, so survivability and safety matter for high-value platforms.",
    badge: "Case and lesson",
  },
};

const securityCaseEn: Record<string, { category: string; focus: string; lesson: string; badge: string }> = {
  "우크라이나전: 드론 대량운용과 C-UAS": {
    category: "Ukraine war: mass drone operations and C-UAS",
    focus: "ISR, FPV, and long-range strike drones evolving alongside electronic warfare, interception, and distributed protection.",
    lesson: "Drones should be understood as a battlefield ecosystem linking production, supply, electronic warfare, and counter-drone defence.",
    badge: "Security and C-UAS",
  },
  "드론 포화공격과 저비용 방어": {
    category: "Drone saturation attacks and low-cost defence",
    focus: "Low-cost drones, loitering munitions, and missile-drone mixed attacks pressuring air-defence cost exchange ratios.",
    lesson: "C-UAS needs layered sensors, electronic warfare, guns, directed energy, and command-and-control, not only expensive interceptors.",
    badge: "Security and C-UAS",
  },
  "나고르노-카라바흐 이후 전쟁 양상 변화": {
    category: "Post-Nagorno-Karabakh changes in warfare",
    focus: "How drones, loitering munitions, and precision strike changed ground combat, air defence, and armored operations.",
    lesson: "In modern warfare, C-UAS is becoming a baseline condition for ground operations, not merely rear-area protection.",
    badge: "Security and C-UAS",
  },
  "공급망·상용부품·AI 드론 경쟁": {
    category: "Supply chain, commercial components, and AI drone competition",
    focus: "Commercial-component dependence, Chinese component supply chains, and AI/ML-enabled drone competition.",
    lesson: "A national-security drone industry depends on core components, communications, navigation, AI, and production capacity as much as finished aircraft.",
    badge: "Security and C-UAS",
  },
  "군용 드론 손실·격추 사례 데이터": {
    category: "Military drone loss and shootdown data",
    focus: "Tracking operational risk and air-defence threats through large military drone crash and shootdown records.",
    lesson: "Crash databases support maintenance, survivability, training, and mission-risk assessment, not only tactical performance analysis.",
    badge: "Security and C-UAS",
  },
};

const modes = [
  { id: "model", label: "자격제도", helper: "누가, 어떤 체계로 조종자를 관리하는가" },
  { id: "pilotClass", label: "자격증 분류", helper: "기종별·등급별 조종자 자격 분류" },
  { id: "operator", label: "운용자 교육", helper: "조종자·운용자 자격과 교육기관 관리" },
  { id: "aircraftClass", label: "기체 등급", helper: "기종·중량·등급별 장비관리 분류" },
  { id: "equipment", label: "장비관리", helper: "등록·신고·안전성 인증·공역승인 절차" },
  { id: "exam", label: "시험 방식", helper: "이론·실기·온라인·허가 절차의 차이" },
  { id: "industry", label: "산업 특징", helper: "시장이 커지는 분야와 정책 신호" },
] as const;

type Mode = (typeof modes)[number]["id"];

const copy = {
  ko: {
    siteTitle: "드론 정책 비교",
    navAria: "고정 주요 메뉴",
    nav: ["처음", "ICAO", "국가", "상세", "🛡 안전", "안보", "점수", "자료"],
    languageAria: "언어 전환",
    manager: "Manager: drone professor, William J. Park.",
    managerScope: "(Consulting for national drone industry Master Plan)",
    heroBadge: "2026 공개자료 기준 · 드론 자격제도 & 산업 비교",
    heroTitle: "국가별 드론 제도와 산업 흐름을 한 화면에서 비교",
    heroDescription:
      "아시아·아프리카 주요국에 더해 UAE·사우디아라비아 등 중동권 드론 제도까지 비교했습니다. 자격 체계, 시험·허가 방식, 규제 강도, 산업 활용 분야를 국가별 카드와 비교 매트릭스로 탐색할 수 있습니다.",
    currentCountry: "현재 선택 국가",
    maturity: "제도 성숙도",
    examClarity: "시험 명확성",
    restriction: "운용 규제 강도",
    market: "산업 확장성",
    icaoTitle: "ICAO 무인항공 기준·행사·자료",
    icaoDescription: "국가별 제도 비교 전에 함께 봐야 할 ICAO의 UAS·RPAS 기준, 모델 규정, 패널 활동, 심포지엄·웨비나 자료를 한곳에 모았습니다.",
    allSources: "전체 참고자료 보기",
    openSource: "자료 열기",
    countryPicker: "Country picker",
    countryCards: "국가별 핵심 카드",
    searchSr: "국가 또는 키워드 검색",
    searchPlaceholder: "예: BVLOS, 농업, 시험, 허가",
    clear: "지우기",
    detailLink: "상세 보기",
    sourceLink: "참고자료 보기",
    selectedView: "Selected view",
    detailTitleSuffix: "상세 보기",
    countrySources: "이 국가 자료 보기",
    model: "자격제도",
    pilotClass: "자격증 기종·등급 분류",
    operator: "운용자 자격·교육",
    aircraftClass: "장비 기종·등급 분류",
    equipment: "장비 등록·신고·인증",
    classNote: "분류 해석 메모",
    classSources: "분류 관련 자료",
    criteriaTitle: "등급별 판단기준",
    criteriaName: "등급·분류",
    criteriaRule: "판단기준",
    weightBasis: "중량 기준 요약",
    infographic: "인포그래픽 보기",
    close: "닫기",
    pilotFlow: "자격·교육 흐름",
    equipmentFlow: "장비관리 흐름",
    sourceFlow: "근거 자료",
    portalFlow: "처리 포털",
    classifyStep: "분류",
    manageStep: "관리",
    verifyStep: "확인",
    agencies: "관련 기관",
    oneStop: "원스톱·공식 포털",
    exam: "시험·허가 방식",
    industry: "산업 특징",
    useCases: "주요 활용 분야",
    matrix: "Comparison matrix",
    matrixSuffix: "비교",
    matrixHint: "국가를 누르면 오른쪽 상세 보기가 바뀝니다.",
    country: "국가",
    safetyTitle: "드론·무인항공기 사고사례와 안전관리 포인트",
    safetyDescription: "공식 사고조사·항공당국 자료를 바탕으로 반복되는 위험 유형을 분류했습니다. 각 링크는 교육자료, 안전관리 기준, 시험·허가 제도 보완 근거로 활용할 수 있습니다.",
    library: "전체 자료실 보기",
    securityTitle: "국가안보 차원의 드론·대드론 전쟁 사례",
    securityDescription:
      "최근 전쟁과 분쟁에서 드론은 정찰·타격·기만·전자전·포화공격 수단으로 확장됐고, 대드론은 다층 방공과 산업 공급망 문제로 연결됩니다. 아래 자료는 안보 정책과 대드론 산업육성 관점의 참고 링크입니다.",
    safetyAnchor: "안전관리 사례로 이동",
    scoresTitle: "제도·시장·규제 강도 스코어",
    scoresDescription: "1~5점은 공식 자료와 정책 신호를 바탕으로 만든 비교용 정성 지표입니다. 법률 자문이나 실제 비행허가를 대체하지 않습니다.",
    sourceTitle: "확인 출처·규정·행사 자료",
    sourceDescription: "ICAO 국제 기준과 국가별 항공당국 자료를 함께 모았습니다. 드론 규정은 수시로 바뀌므로 실제 비행·사업화 전에는 현지 허가 절차를 다시 확인해야 합니다.",
    icaoAnchor: "ICAO 허브로 이동",
    icaoSources: "ICAO 글로벌 자료",
  },
  en: {
    siteTitle: "Drone Policy Comparator",
    navAria: "Sticky primary menu",
    nav: ["Top", "ICAO", "Countries", "Detail", "🛡 Safety", "Security", "Scores", "Sources"],
    languageAria: "Language switcher",
    manager: "Manager: drone professor, William J. Park.",
    managerScope: "(Consulting for national drone industry Master Plan)",
    heroBadge: "Based on 2026 public sources · Drone licensing and industry comparison",
    heroTitle: "Compare national drone rules and industry signals in one view",
    heroDescription:
      "This comparator covers major Asian and African countries plus Middle Eastern markets including the UAE and Saudi Arabia. Explore licensing systems, exam and permit paths, regulatory intensity, and industry use cases through country cards and a comparison matrix.",
    currentCountry: "Selected country",
    maturity: "Regulatory maturity",
    examClarity: "Exam clarity",
    restriction: "Operating restrictions",
    market: "Industry scalability",
    icaoTitle: "ICAO unmanned aviation standards, events, and resources",
    icaoDescription: "A single starting point for ICAO UAS and RPAS standards, model regulations, panel activity, symposia, and webinar material that should be read before comparing national systems.",
    allSources: "View all sources",
    openSource: "Open source",
    countryPicker: "Country picker",
    countryCards: "Country key cards",
    searchSr: "Search country or keyword",
    searchPlaceholder: "Try: BVLOS, agriculture, exam, permit",
    clear: "Clear",
    detailLink: "View detail",
    sourceLink: "View sources",
    selectedView: "Selected view",
    detailTitleSuffix: "detail",
    countrySources: "View this country's sources",
    model: "Licensing system",
    pilotClass: "Pilot certificate type and grade classes",
    operator: "Operator qualification and training",
    aircraftClass: "Aircraft type and equipment classes",
    equipment: "Aircraft registration, reporting, and certification",
    classNote: "Classification note",
    classSources: "Classification references",
    criteriaTitle: "Criteria by class",
    criteriaName: "Class or category",
    criteriaRule: "Criterion",
    weightBasis: "Weight threshold summary",
    infographic: "View infographic",
    close: "Close",
    pilotFlow: "Qualification and training flow",
    equipmentFlow: "Equipment management flow",
    sourceFlow: "Source references",
    portalFlow: "Service portals",
    classifyStep: "Classify",
    manageStep: "Manage",
    verifyStep: "Verify",
    agencies: "Relevant authorities",
    oneStop: "One-stop and official portals",
    exam: "Exam and permit path",
    industry: "Industry signal",
    useCases: "Primary use cases",
    matrix: "Comparison matrix",
    matrixSuffix: "comparison",
    matrixHint: "Select a country to update the detail view on the right.",
    country: "Country",
    safetyTitle: "Drone and UAS accident cases with safety-management points",
    safetyDescription: "Recurring risk types are grouped from official accident-investigation and aviation-authority material. Each link can support training, safety criteria, and exam or permit-system improvement.",
    library: "View full source library",
    securityTitle: "Drone and counter-drone warfare cases in national security",
    securityDescription:
      "Recent wars and conflicts show drones expanding into ISR, strike, deception, electronic warfare, and saturation attacks, while counter-drone policy now connects to layered air defence and industrial supply chains.",
    safetyAnchor: "Go to safety cases",
    scoresTitle: "Regulation, market, and restriction scores",
    scoresDescription: "Scores from 1 to 5 are qualitative comparison indicators based on official material and policy signals. They do not replace legal advice or flight authorization.",
    sourceTitle: "Verified sources, regulations, and event material",
    sourceDescription: "ICAO global material and national aviation-authority sources are gathered here. Drone rules change frequently, so local permit procedures should be rechecked before actual flight or commercialization.",
    icaoAnchor: "Go to ICAO hub",
    icaoSources: "ICAO global resources",
  },
} satisfies Record<Language, Record<string, string | string[]>>;

const modeCopy: Record<Language, Record<Mode, { label: string; helper: string }>> = {
  ko: {
    model: { label: "자격제도", helper: "누가, 어떤 체계로 조종자를 관리하는가" },
    pilotClass: { label: "자격증 분류", helper: "기종별·등급별 조종자 자격 분류" },
    operator: { label: "운용자 교육", helper: "조종자·운용자 자격과 교육기관 관리" },
    aircraftClass: { label: "기체 등급", helper: "기종·중량·등급별 장비관리 분류" },
    equipment: { label: "장비관리", helper: "등록·신고·안전성 인증·공역승인 절차" },
    exam: { label: "시험 방식", helper: "이론·실기·온라인·허가 절차의 차이" },
    industry: { label: "산업 특징", helper: "시장이 커지는 분야와 정책 신호" },
  },
  en: {
    model: { label: "Licensing system", helper: "Who manages remote pilots, and through what framework?" },
    pilotClass: { label: "Certificate classes", helper: "Pilot certificate classes by aircraft type and grade" },
    operator: { label: "Operator training", helper: "Pilot/operator qualification and training-provider control" },
    aircraftClass: { label: "Aircraft classes", helper: "Equipment control by type, weight, and class" },
    equipment: { label: "Equipment control", helper: "Registration, reporting, certification, and airspace approval" },
    exam: { label: "Exam pathway", helper: "Differences in theory, practical, online, and permit procedures" },
    industry: { label: "Industry signal", helper: "Where the market is expanding and what policy signals matter" },
  },
};

function localCountry(country: Country, language: Language) {
  if (language === "ko") return country;
  const translated = countryEn[country.id];

  return {
    ...country,
    ...translated,
    sources: country.sources.map((source, index) => ({
      ...source,
      label: translated.sourceLabels[index] ?? source.label,
    })),
  };
}

function localCompliance(countryId: string, language: Language) {
  return language === "ko" ? complianceKo[countryId] : complianceEn[countryId];
}

function localClassification(countryId: string, language: Language) {
  return language === "ko" ? classificationKo[countryId] : classificationEn[countryId];
}

function localCriteria(countryId: string, language: Language) {
  return language === "ko" ? criteriaKo[countryId] : criteriaEn[countryId];
}

function localWeightCriteria(countryId: string, language: Language) {
  return language === "ko" ? weightCriteriaKo[countryId] : weightCriteriaEn[countryId];
}

function Bar({ value, tone = "cyan" }: { value: number; tone?: "cyan" | "amber" | "emerald" | "rose" }) {
  const color =
    tone === "amber"
      ? "from-amber-300 to-orange-400"
      : tone === "emerald"
        ? "from-emerald-300 to-teal-400"
        : tone === "rose"
          ? "from-rose-300 to-pink-500"
          : "from-cyan-300 to-blue-500";

  return (
    <div className="h-2 rounded-full bg-white/10">
      <div
        className={`h-2 rounded-full bg-gradient-to-r ${color}`}
        style={{ width: `${value * 20}%` }}
      />
    </div>
  );
}

function ScorePill({ label, value, tone }: { label: string; value: number; tone?: "cyan" | "amber" | "emerald" | "rose" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span>{value}/5</span>
      </div>
      <Bar value={value} tone={tone} />
    </div>
  );
}

export default function Home() {
  const [selectedId, setSelectedId] = useState("korea");
  const [mode, setMode] = useState<Mode>("model");
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<Language>("ko");
  const [classificationModal, setClassificationModal] = useState<ClassificationModal>(null);

  const selected = countries.find((country) => country.id === selectedId) ?? countries[0];
  const selectedView = localCountry(selected, language);
  const selectedCompliance = localCompliance(selected.id, language);
  const selectedClassification = localClassification(selected.id, language);
  const selectedCriteria = localCriteria(selected.id, language);
  const selectedWeightCriteria = localWeightCriteria(selected.id, language);
  const t = copy[language];
  const navLabels = t.nav as string[];
  const currentMode = modeCopy[language][mode];

  const filteredCountries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return countries;

    return countries.filter((country) => {
      const display = localCountry(country, language);
      const compliance = localCompliance(country.id, language);
      const classification = localClassification(country.id, language);
      const criteria = localCriteria(country.id, language);
      const weight = localWeightCriteria(country.id, language);

      return [
        display.name,
        display.region,
        display.authority,
        display.model,
        classification.pilot,
        classification.aircraft,
        classification.note,
        classification.links.map((link) => link.label).join(" "),
        criteria.pilot.map((item) => `${item.label} ${item.criterion}`).join(" "),
        criteria.aircraft.map((item) => `${item.label} ${item.criterion}`).join(" "),
        weight.pilot,
        weight.aircraft,
        compliance.operator,
        compliance.equipment,
        compliance.agencies,
        compliance.portals.map((portal) => `${portal.label} ${portal.note}`).join(" "),
        display.exam,
        display.industry,
        display.tags.join(" "),
        display.useCases.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [language, query]);

  const matrixText = (country: Country) => {
    const display = localCountry(country, language);
    const compliance = localCompliance(country.id, language);
    const classification = localClassification(country.id, language);
    if (mode === "pilotClass") return classification.pilot;
    if (mode === "operator") return compliance.operator;
    if (mode === "aircraftClass") return classification.aircraft;
    if (mode === "equipment") return compliance.equipment;
    if (mode === "exam") return display.exam;
    if (mode === "industry") return display.industry;
    return display.model;
  };

  const navItems = [
    ["#top", navLabels[0]],
    ["#icao-hub", navLabels[1]],
    ["#country-cards", navLabels[2]],
    ["#selected-detail", navLabels[3]],
    ["#safety-management", navLabels[4]],
    ["#security-cases", navLabels[5]],
    ["#scoreboard", navLabels[6]],
    ["#source-notebook", navLabels[7]],
  ];
  const infographicTitle =
    classificationModal === "pilot" ? (t.pilotClass as string) : (t.aircraftClass as string);
  const infographicFlow =
    classificationModal === "pilot"
      ? [
          { label: t.classifyStep as string, title: t.pilotClass as string, text: selectedClassification.pilot },
          { label: t.manageStep as string, title: t.operator as string, text: selectedCompliance.operator },
          { label: t.verifyStep as string, title: t.classNote as string, text: selectedClassification.note },
        ]
      : [
          { label: t.classifyStep as string, title: t.aircraftClass as string, text: selectedClassification.aircraft },
          { label: t.manageStep as string, title: t.equipment as string, text: selectedCompliance.equipment },
          { label: t.verifyStep as string, title: t.agencies as string, text: selectedCompliance.agencies },
        ];
  const infographicCriteria = classificationModal === "pilot" ? selectedCriteria.pilot : selectedCriteria.aircraft;
  const infographicWeight = classificationModal === "pilot" ? selectedWeightCriteria.pilot : selectedWeightCriteria.aircraft;

  return (
    <main id="top" lang={language} className="min-h-screen overflow-x-hidden bg-[#07111f] text-slate-50">
      <nav
        aria-label={t.navAria as string}
        className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/82 px-3 py-2 shadow-xl shadow-slate-950/30 backdrop-blur-xl sm:px-6 lg:px-10"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 sm:gap-3">
          <a href="#top" className="shrink-0 text-sm font-semibold text-white">
            {t.siteTitle as string}
          </a>
          <div className="order-3 flex w-full min-w-0 gap-2 overflow-x-auto pb-1 sm:order-none sm:w-auto sm:flex-1">
            {navItems.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className={
                  href === "#safety-management"
                    ? "shrink-0 rounded-full border border-amber-300/40 bg-amber-300/15 px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:bg-amber-300/25"
                    : href === "#security-cases"
                      ? "shrink-0 rounded-full border border-rose-300/40 bg-rose-300/15 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-300/25"
                      : "shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-cyan-200/50 hover:bg-cyan-300/10 hover:text-cyan-100"
                }
              >
                {label}
              </a>
            ))}
          </div>
          <a
            href="mailto:legend@droneac.org"
            className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium leading-5 text-slate-300 transition hover:border-cyan-200/50 hover:text-cyan-100"
            title="legend@droneac.org"
          >
            {t.manager as string} <span className="hidden lg:inline">{t.managerScope as string}</span>
          </a>
          <div className="flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] p-1" aria-label={t.languageAria as string}>
            {[
              { id: "ko", label: "🇰🇷 한글" },
              { id: "en", label: "🇺🇸 English" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLanguage(item.id as Language)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                  language === item.id
                    ? "bg-cyan-300 text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <section className="relative border-b border-white/10 px-5 py-7 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,.24),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,.24),transparent_32%),linear-gradient(135deg,#07111f,#101827_46%,#06111d)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100 shadow-2xl shadow-cyan-950/40">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              {t.heroBadge as string}
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {t.heroTitle as string}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                {t.heroDescription as string}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {modes.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setMode(item.id)}
                  className={`rounded-2xl px-4 py-3 text-left transition ${
                    mode === item.id
                      ? "bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/30"
                      : "border border-white/10 bg-white/5 text-slate-200 hover:border-cyan-200/50 hover:bg-white/10"
                  }`}
                >
                  <span className="block text-sm font-semibold">{modeCopy[language][item.id].label}</span>
                  <span className="mt-1 block text-xs opacity-75">{modeCopy[language][item.id].helper}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-slate-950/50 backdrop-blur">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">{t.currentCountry as string}</p>
                  <h2 className="mt-1 text-3xl font-semibold">
                    <span className="mr-2">{selectedView.flag}</span>
                    {selectedView.name}
                  </h2>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{selectedView.region}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <ScorePill label={t.maturity as string} value={selected.maturity} tone="cyan" />
                <ScorePill label={t.examClarity as string} value={selected.examClarity} tone="emerald" />
                <ScorePill label={t.restriction as string} value={selected.restriction} tone="amber" />
                <ScorePill label={t.market as string} value={selected.market} tone="rose" />
              </div>
              <div className="mt-5 rounded-2xl bg-cyan-300/10 p-4 text-sm leading-7 text-cyan-50">
                {selectedView.signal}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="icao-hub" className="scroll-mt-20 px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-cyan-300/20 bg-cyan-300/[0.06] p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">ICAO global hub</p>
              <h2 className="mt-3 text-3xl font-semibold">{t.icaoTitle as string}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                {t.icaoDescription as string}
              </p>
            </div>
            <a
              href="#source-notebook"
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              {t.allSources as string}
              <span aria-hidden className="ml-2">↓</span>
            </a>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {icaoResources.map((resource) => (
              <a
                key={resource.href}
                href={resource.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-3xl border border-white/10 bg-slate-950/35 p-4 transition hover:border-cyan-200/50 hover:bg-slate-900/80"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">ICAO</span>
                <h3 className="mt-2 text-base font-semibold text-white">{resource.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{language === "en" ? icaoNotesEn[resource.href] : resource.note}</p>
                <span className="mt-3 inline-flex text-sm text-cyan-200">{t.openSource as string} ↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="country-cards" className="scroll-mt-20 px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">{t.countryPicker as string}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">{t.countryCards as string}</h2>
            </div>
            <label className="relative w-full md:max-w-sm">
              <span className="sr-only">{t.searchSr as string}</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.searchPlaceholder as string}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-4 pr-16 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/60"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/20"
                  aria-label={t.clear as string}
                >
                  {t.clear as string}
                </button>
              ) : null}
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCountries.map((country) => {
              const display = localCountry(country, language);

              return (
              <article
                key={country.id}
                className={`group rounded-3xl border p-5 transition ${
                  selected.id === country.id
                    ? "border-cyan-300/70 bg-cyan-300/10 shadow-xl shadow-cyan-950/30"
                    : "border-white/10 bg-white/[0.04] hover:border-white/30 hover:bg-white/[0.07]"
                }`}
              >
                <button type="button" onClick={() => setSelectedId(country.id)} className="w-full text-left">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-4xl">{country.flag}</p>
                      <h3 className="mt-3 text-2xl font-semibold">{display.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">{display.authority}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{display.region}</span>
                  </div>
                  <p className="min-h-24 text-sm leading-7 text-slate-300">{display.signal}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {display.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                  <a
                    href="#selected-detail"
                    onClick={() => setSelectedId(country.id)}
                    className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-cyan-300/20 hover:text-cyan-100"
                  >
                    {t.detailLink as string} ↓
                  </a>
                  <a
                    href={`#source-${country.id}`}
                    onClick={() => setSelectedId(country.id)}
                    className="rounded-full bg-cyan-300/15 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/25"
                  >
                    {t.sourceLink as string} ↓
                  </a>
                </div>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="selected-detail" className="scroll-mt-20 px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 lg:order-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">{t.selectedView as string}</p>
                <h2 className="mt-3 text-3xl font-semibold">
                  {selectedView.flag} {selectedView.name} {t.detailTitleSuffix as string}
                </h2>
              </div>
              <a
                href={`#source-${selected.id}`}
                className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
              >
                {t.countrySources as string}
                <span aria-hidden className="ml-2">↓</span>
              </a>
            </div>
            <div className="mt-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-cyan-100">{t.model as string}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{selectedView.model}</p>
              </div>
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-semibold text-cyan-100">{t.pilotClass as string}</h3>
                  <button
                    type="button"
                    onClick={() => setClassificationModal("pilot")}
                    className="inline-flex items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
                  >
                    {t.infographic as string}
                  </button>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-300">{selectedClassification.pilot}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-cyan-100">{t.operator as string}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{selectedCompliance.operator}</p>
              </div>
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-semibold text-cyan-100">{t.aircraftClass as string}</h3>
                  <button
                    type="button"
                    onClick={() => setClassificationModal("aircraft")}
                    className="inline-flex items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
                  >
                    {t.infographic as string}
                  </button>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-300">{selectedClassification.aircraft}</p>
                <div className="mt-3 rounded-xl bg-slate-950/45 px-3 py-2 text-xs leading-5 text-slate-300">
                  <span className="font-semibold text-cyan-100">{t.classNote as string}: </span>
                  {selectedClassification.note}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-cyan-100">{t.equipment as string}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{selectedCompliance.equipment}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-cyan-100">{t.agencies as string}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{selectedCompliance.agencies}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-cyan-100">{t.exam as string}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{selectedView.exam}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-cyan-100">{t.industry as string}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{selectedView.industry}</p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-cyan-100">{t.useCases as string}</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {selectedView.useCases.map((useCase) => (
                  <div key={useCase} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                    {useCase}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-cyan-100">{t.oneStop as string}</h3>
              <div className="mt-3 space-y-3">
                {selectedCompliance.portals.map((portal) => (
                  <a
                    key={portal.href}
                    href={portal.href}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07] p-4 transition hover:border-cyan-200/60 hover:bg-cyan-300/[0.12]"
                  >
                    <span className="text-sm font-semibold text-cyan-100">{portal.label}</span>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{portal.note}</p>
                    <span className="mt-2 inline-flex text-xs text-cyan-200">{t.openSource as string} ↗</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-cyan-100">{t.classSources as string}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedClassification.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/10"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 lg:order-1">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">{t.matrix as string}</p>
                <h2 className="mt-3 text-3xl font-semibold">{currentMode.label} {t.matrixSuffix as string}</h2>
              </div>
              <p className="text-sm text-slate-400">{t.matrixHint as string}</p>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
              <div className="grid grid-cols-[7.5rem_1fr] bg-white/10 text-xs font-semibold text-slate-300 sm:grid-cols-[9rem_1fr]">
                <div className="border-r border-white/10 px-4 py-3">{t.country as string}</div>
                <div className="px-4 py-3">{currentMode.helper}</div>
              </div>
              {countries.map((country) => {
                const display = localCountry(country, language);

                return (
                <button
                  key={country.id}
                  onClick={() => setSelectedId(country.id)}
                  className={`grid w-full grid-cols-[7.5rem_1fr] border-t border-white/10 text-left transition sm:grid-cols-[9rem_1fr] ${
                    selected.id === country.id ? "bg-cyan-300/10" : "hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="border-r border-white/10 px-4 py-4">
                    <span className="mr-2">{country.flag}</span>
                    <span className="font-semibold">{display.name}</span>
                  </div>
                  <div className="px-4 py-4 text-sm leading-7 text-slate-300">{matrixText(country)}</div>
                </button>
                );
              })}
            </div>
          </article>
        </div>
      </section>

      <section id="safety-management" className="scroll-mt-20 px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-amber-300/20 bg-amber-300/[0.06] p-6">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-200">Safety management</p>
              <h2 className="mt-3 text-3xl font-semibold">{t.safetyTitle as string}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                {t.safetyDescription as string}
              </p>
            </div>
            <a
              href="#source-notebook"
              className="inline-flex items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/20"
            >
              {t.library as string}
              <span aria-hidden className="ml-2">↓</span>
            </a>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {safetyCases.map((item) => {
              const display = language === "en" ? safetyCaseEn[item.category] : { ...item, badge: "사례·교훈" };

              return (
              <article key={item.category} className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{display.category}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{display.focus}</p>
                  </div>
                  <span className="rounded-full bg-amber-300/15 px-3 py-1 text-xs font-semibold text-amber-100">{display.badge}</span>
                </div>
                <div className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-300/[0.07] p-4 text-sm leading-7 text-amber-50">
                  {display.lesson}
                </div>
                <ul className="mt-4 space-y-3">
                  {item.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm leading-6 text-cyan-200 underline-offset-4 hover:text-cyan-100 hover:underline"
                      >
                        {link.label}
                        <span aria-hidden>↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="security-cases" className="scroll-mt-20 px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-rose-300/20 bg-rose-300/[0.06] p-6">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-rose-200">National security</p>
              <h2 className="mt-3 text-3xl font-semibold">{t.securityTitle as string}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                {t.securityDescription as string}
              </p>
            </div>
            <a
              href="#safety-management"
              className="inline-flex items-center justify-center rounded-2xl border border-rose-300/30 bg-rose-300/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-300/20"
            >
              {t.safetyAnchor as string} ↑
            </a>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {securityCases.map((item) => {
              const display = language === "en" ? securityCaseEn[item.category] : { ...item, badge: "안보·대드론" };

              return (
              <article key={item.category} className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{display.category}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{display.focus}</p>
                  </div>
                  <span className="rounded-full bg-rose-300/15 px-3 py-1 text-xs font-semibold text-rose-100">{display.badge}</span>
                </div>
                <div className="mt-4 rounded-2xl border border-rose-300/15 bg-rose-300/[0.07] p-4 text-sm leading-7 text-rose-50">
                  {display.lesson}
                </div>
                <ul className="mt-4 space-y-3">
                  {item.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm leading-6 text-cyan-200 underline-offset-4 hover:text-cyan-100 hover:underline"
                      >
                        {link.label}
                        <span aria-hidden>↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="scoreboard" className="scroll-mt-20 px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/[0.05] p-6">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">At-a-glance scores</p>
              <h2 className="mt-3 text-3xl font-semibold">{t.scoresTitle as string}</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-400">
              {t.scoresDescription as string}
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {countries.map((country) => {
              const display = localCountry(country, language);

              return (
              <div key={country.id} className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                    <span className="mr-2">{country.flag}</span>
                    {display.name}
                  </h3>
                  <span className="text-xs text-slate-400">{display.region}</span>
                </div>
                <div className="space-y-3">
                  <ScorePill label={t.maturity as string} value={country.maturity} tone="cyan" />
                  <ScorePill label={t.examClarity as string} value={country.examClarity} tone="emerald" />
                  <ScorePill label={t.restriction as string} value={country.restriction} tone="amber" />
                  <ScorePill label={t.market as string} value={country.market} tone="rose" />
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="source-notebook" className="scroll-mt-20 px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">Source notebook</p>
              <h2 className="mt-3 text-3xl font-semibold">{t.sourceTitle as string}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                {t.sourceDescription as string}
              </p>
            </div>
            <a
              href="#icao-hub"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              {t.icaoAnchor as string} ↑
            </a>
          </div>
          <div className="mb-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
            <h3 className="text-lg font-semibold">{t.icaoSources as string}</h3>
            <div className="mt-4 grid max-h-[22rem] gap-3 overflow-y-auto pr-2 md:grid-cols-2">
              {icaoResources.map((resource) => (
                <a
                  key={resource.href}
                  href={resource.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 transition hover:border-cyan-200/50 hover:bg-slate-900/80"
                >
                  <span className="text-sm font-semibold text-cyan-100">{resource.label}</span>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{language === "en" ? icaoNotesEn[resource.href] : resource.note}</p>
                  <span className="mt-2 inline-flex text-xs text-cyan-200">{t.openSource as string} ↗</span>
                </a>
              ))}
            </div>
          </div>
          <div className="grid max-h-[42rem] gap-4 overflow-y-auto pr-2 md:grid-cols-2 xl:grid-cols-3">
            {countries.map((country) => {
              const display = localCountry(country, language);
              const compliance = localCompliance(country.id, language);
              const classification = localClassification(country.id, language);

              return (
              <div
                key={country.id}
                id={`source-${country.id}`}
                className={`scroll-mt-20 rounded-3xl border p-5 ${
                  selected.id === country.id ? "border-cyan-300/60 bg-cyan-300/10" : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <h3 className="text-lg font-semibold">
                  <span className="mr-2">{country.flag}</span>
                  {display.name}
                </h3>
                <p className="mt-1 text-xs text-slate-400">{display.authority}</p>
                <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
                  <h4 className="text-sm font-semibold text-cyan-100">{t.oneStop as string}</h4>
                  <ul className="mt-3 space-y-3">
                    {compliance.portals.map((portal) => (
                      <li key={portal.href}>
                        <a
                          href={portal.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm leading-6 text-cyan-200 underline-offset-4 hover:text-cyan-100 hover:underline"
                        >
                          {portal.label}
                          <span aria-hidden>↗</span>
                        </a>
                        <p className="mt-1 text-xs leading-5 text-slate-400">{portal.note}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-4">
                  <h4 className="text-sm font-semibold text-emerald-100">{t.classSources as string}</h4>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{classification.note}</p>
                  <ul className="mt-3 space-y-3">
                    {classification.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm leading-6 text-cyan-200 underline-offset-4 hover:text-cyan-100 hover:underline"
                        >
                          {link.label}
                          <span aria-hidden>↗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <ul className="mt-4 space-y-3">
                  {display.sources.map((source) => (
                    <li key={source.href}>
                      <a
                        href={source.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm leading-6 text-cyan-200 underline-offset-4 hover:text-cyan-100 hover:underline"
                      >
                        {source.label}
                        <span aria-hidden>↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              );
            })}
          </div>
        </div>
      </section>
      {classificationModal ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/82 px-4 py-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="classification-modal-title"
          onClick={() => setClassificationModal(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-cyan-300/25 bg-[#081321] p-5 shadow-2xl shadow-cyan-950/50 sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">
                  {selectedView.flag} {selectedView.name}
                </p>
                <h2 id="classification-modal-title" className="mt-2 text-3xl font-semibold text-white">
                  {infographicTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setClassificationModal(null)}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                {t.close as string}
              </button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {infographicFlow.map((step, index) => (
                <div key={step.title} className="relative rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-300 text-sm font-bold text-slate-950">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{step.label}</p>
                      <h3 className="mt-1 text-lg font-semibold text-white">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-slate-300">{step.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-3xl border border-amber-300/20 bg-amber-300/[0.08] p-5">
              <h3 className="text-sm font-semibold text-amber-100">{t.weightBasis as string}</h3>
              <p className="mt-3 text-sm leading-7 text-amber-50">{infographicWeight}</p>
            </div>

            <div className="mt-5 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
              <h3 className="text-sm font-semibold text-cyan-100">{t.criteriaTitle as string}</h3>
              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                <div className="hidden grid-cols-[12rem_1fr] bg-white/10 text-xs font-semibold text-slate-300 sm:grid">
                  <div className="border-r border-white/10 px-4 py-3">{t.criteriaName as string}</div>
                  <div className="px-4 py-3">{t.criteriaRule as string}</div>
                </div>
                {infographicCriteria.map((item) => (
                  <div key={item.label} className="grid gap-2 border-t border-white/10 px-4 py-4 sm:grid-cols-[12rem_1fr] sm:gap-0 sm:px-0 sm:py-0">
                    <div className="font-semibold text-white sm:border-r sm:border-white/10 sm:px-4 sm:py-4">{item.label}</div>
                    <div className="text-sm leading-7 text-slate-300 sm:px-4 sm:py-4">{item.criterion}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
                <h3 className="text-sm font-semibold text-emerald-100">
                  {classificationModal === "pilot" ? (t.sourceFlow as string) : (t.portalFlow as string)}
                </h3>
                <ul className="mt-4 space-y-3">
                  {(classificationModal === "pilot" ? selectedClassification.links : selectedCompliance.portals).map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm leading-6 text-cyan-200 underline-offset-4 hover:text-cyan-100 hover:underline"
                      >
                        {link.label}
                        <span aria-hidden>↗</span>
                      </a>
                      {"note" in link ? <p className="mt-1 text-xs leading-5 text-slate-400">{link.note}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
                <h3 className="text-sm font-semibold text-cyan-100">{t.classNote as string}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{selectedClassification.note}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
