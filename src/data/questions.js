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
      { id: "2", text: " B - Blueberry" },
      { id: "3", text: " C - Pear" },
      { id: "4", text: " D - Apple", correct: true }
    ],
    visible: true
  }
];

export default questions;
