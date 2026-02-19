
import type { Quiz } from '../../types/quiz';

export const SPELLING_QUIZZES: Partial<Quiz>[] = [
    { question: "'(낫/낮/낯)'을 가리다.", options: ["낫", "낮", "낯", "낟"], correctIndex: 2 },
    { question: "'(반드시/반듯이)' 약속을 지키겠다.", options: ["반드시", "반듯이", "반듯히", "반드시다"], correctIndex: 0 },
    { question: "고개를 '(숙이다/수기다)'.", options: ["숙이다", "수기다", "숙히다", "수귀다"], correctIndex: 0 },
    { question: "'(어이/어의)'가 없다.", options: ["어이", "어의", "어위", "으이"], correctIndex: 0 },
    { question: "'(금세/금새)' 밥이 다 되었다.", options: ["금세", "금새", "금시에", "그새"], correctIndex: 0 },
    { question: "'(몇 일/며칠)' 동안 비가 왔다.", options: ["몇 일", "며칠", "몇일", "면일"], correctIndex: 1 },
    { question: "'(오랫만에/오랜만에)' 친구를 만났다.", options: ["오랫만에", "오랜만에", "오랜만애", "오랫만애"], correctIndex: 1 },
    { question: "'(봬요/뵈요)' 내일 봐요.", options: ["봬요", "뵈요", "베요", "배요"], correctIndex: 0 },
    { question: "'(굳이/구지)' 갈 필요 없다.", options: ["굳이", "구지", "굿이", "궂이"], correctIndex: 0 },
    { question: "'(희안하다/희한하다)' 정말 이상하다.", options: ["희안하다", "희한하다", "희환하다", "히안하다"], correctIndex: 1 },
    { question: "김치찌개를 '(끓이다/클이다)'.", options: ["끓이다", "클이다", "끌이다", "끏이다"], correctIndex: 0 },
    { question: "문을 '(잠그다/잠구다)'.", options: ["잠그다", "잠구다", "잠가다", "잠거다"], correctIndex: 0 },
    { question: "'(설거지/설걷이)'를 하다.", options: ["설거지", "설걷이", "설거지이", "설겆이"], correctIndex: 0 },
    { question: "'(일일이/일일히)' 설명하다.", options: ["일일이", "일일히", "일일리", "일릴이"], correctIndex: 0 },
    { question: "'(곰곰이/곰곰히)' 생각하다.", options: ["곰곰이", "곰곰히", "꼼꼼이", "곰고미"], correctIndex: 0 },
    { question: "'(깨끗이/깨끗히)' 닦다.", options: ["깨끗이", "깨끗히", "깨끄시", "깨끝이"], correctIndex: 0 },
    { question: "'(깊숙이/깊숙히)' 넣다.", options: ["깊숙이", "깊숙히", "깊수기", "깁숙이"], correctIndex: 0 },
    { question: "'(솔직이/솔직히)' 말하다.", options: ["솔직이", "솔직히", "솔지기", "솔직희"], correctIndex: 1 },
    { question: "'(틈틈이/틈틈히)' 공부하다.", options: ["틈틈이", "틈틈히", "틈트미", "틈뜸이"], correctIndex: 0 },
    { question: "하늘을 '(날다/나르다)'.", options: ["날다", "나르다", "날르다", "나ร다"], correctIndex: 0 },
];

export const IDIOM_QUIZZES: Partial<Quiz>[] = [
    { question: "'가는 날이 ( )' - 뜻하지 않은 일을 공교롭게 당함", options: ["장날", "제사", "생일", "잔치"], correctIndex: 0 },
    { question: "'( )도 위 아래가 있다' - 차례와 질서가 중요함", options: ["찬물", "더운물", "밥", "국"], correctIndex: 0 },
    { question: "'( ) 놓고 기역 자도 모른다' - 아주 무식함", options: ["낫", "호미", "삽", "가위"], correctIndex: 0 },
    { question: "'( ) 정성이다' - 정성이 지극함", options: ["지장", "지극", "지성", "치성"], correctIndex: 2 },
    { question: "'( )에 콩 나듯' - 아주 드물게", options: ["가뭄", "장마", "태풍", "홍수"], correctIndex: 0 },
    { question: "'개천에서 ( ) 난다' - 어려운 환경에서 훌륭한 사람이 됨", options: ["용", "호랑이", "미꾸라지", "붕어"], correctIndex: 0 },
    { question: "'고래 싸움에 ( ) 등 터진다' - 강자들 싸움에 약자가 피해 봄", options: ["새우", "멸치", "상어", "고등어"], correctIndex: 0 },
    { question: "'공든 ( )이 무너지랴' - 정성을 다한 일은 헛되지 않음", options: ["탑", "집", "성", "담"], correctIndex: 0 },
    { question: "'구슬이 서 말이라도 ( )여야 보배' - 아무리 좋아도 쓸모 있게 만들어야 함", options: ["꿰", "깨", "닦", "팔"], correctIndex: 0 },
    { question: "'그림의 ( )' - 아무리 원해도 가질 수 없음", options: ["떡", "빵", "꽃", "별"], correctIndex: 0 },
    { question: "'금강산도 ( )경' - 아무리 좋은 것도 배가 불러야 즐거움", options: ["식후", "사후", "음주", "가무"], correctIndex: 0 },
    { question: "'꼬리가 길면 ( )' - 나쁜 짓을 오래 하면 결국 들킴", options: ["잡힌다", "잘린다", "밟힌다", "보인다"], correctIndex: 2 },
    { question: "'꿩 대신 ( )' - 적당한 것이 없으면 비슷한 것으로 대신함", options: ["닭", "오리", "비둘기", "참새"], correctIndex: 0 },
    { question: "'남의 떡이 더 ( ) 보인다' - 남의 것이 더 좋아 보임", options: ["커", "작아", "많아", "맛있어"], correctIndex: 0 },
    { question: "'누워서 ( ) 먹기' - 아주 쉬운 일", options: ["떡", "죽", "밥", "물"], correctIndex: 0 },
    { question: "'다 된 밥에 ( ) 뿌리기' - 잘 되어가는 일을 망침", options: ["재", "물", "소금", "흙"], correctIndex: 0 },
    { question: "'( ) 잃고 외양간 고친다' - 이미 실패한 뒤에 뒤늦게 수습함", options: ["소", "말", "닭", "돼지"], correctIndex: 0 },
    { question: "'등잔 ( )이 어둡다' - 가까운 일을 더 모름", options: ["밑", "위", "옆", "뒤"], correctIndex: 0 },
    { question: "'( )이 무섭다' - 습관이나 버릇은 고치기 어려움", options: ["세 살 버릇", "천 살 버릇", "백 살 버릇", "열 살 버릇"], correctIndex: 0 }, // Slightly modified for quiz format
    { question: "'말 한 마디로 ( ) 빚 갚는다' - 말만 잘하면 어려운 일도 해결됨", options: ["천 냥", "만 냥", "백 냥", "일 냥"], correctIndex: 0 },
];
