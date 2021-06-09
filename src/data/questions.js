const questions = [
  {
    question: "Qual é o endereço IP do localhost?",
    answers: [
      { id: "1", text: " A - 192.168.1.1" },
      { id: "2", text: " B - 127.0.0.1", correct: true },
      { id: "3", text: " C - 209.85.231.5" },
      { id: "4", text: " D - 66.220.149.25" }
    ],
    visible: true
  },
  {
    question: "Que computador foi nomeado em 1984 com um nome de fruta?",
    answers: [
      { id: "1", text: " A - Blackberry" },
      { id: "2", text: " B - Blueberry" ,correct: true},
      { id: "3", text: " C - Pear" },
      { id: "4", text: " D - Apple" }
    ],
    visible: true
  },
  {
    question: "Qual das alternativas contém apenas vacinas contra a covid-19?",
    answers: [
      { id: "1", text: " A - VIP/VOP e AstraZeneca" },
      { id: "2", text: " B - HPV e BioNTech" },
      { id: "3", text: " C - CoronaVac e AstraZeneca", correct: true },
      { id: "4", text: " D - Rotavírus e CoronaVac"}
    ],
    visible: true
  },
  {
    question: "Qual foi a revolução que alavancou a independência do Brasil e em 2017 completou o segundo centenário?",
    answers: [
      { id: "1", text: " A - Farroupilha" },
      { id: "2", text: " B - Federalista" },
      { id: "3", text: " C - Praieira" },
      { id: "4", text: " D - Pernambucana", correct: true}
    ],
    visible: true
  }
];

export default questions;
