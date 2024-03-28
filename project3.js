let state = {
  page: "start",
  name: "",
  quiz: null,
  score: 0,
  questionIndex: 0,
  total: 0,
  quizzes: [
    { id: 1, name: "Quiz 1" },
    { id: 2, name: "Quiz 2" },
  ],
};

let app;
let startTemplate, quizTemplate, feedbackTemplate, resultTemplate;

document.addEventListener("DOMContentLoaded", function () {
  app = document.getElementById("app");

  Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });

  startTemplate = Handlebars.compile(
    document.getElementById("start-template").innerHTML
  );
  quizTemplate = Handlebars.compile(
    document.getElementById("quiz-template").innerHTML
  );
  feedbackTemplate = Handlebars.compile(
    document.getElementById("feedback-template").innerHTML
  );
  resultTemplate = Handlebars.compile(
    document.getElementById("result-template").innerHTML
  );
  render();
});

function render() {
  switch (state.page) {
    case "start":
      app.innerHTML = startTemplate(state);
      document
        .getElementById("start-quiz-button")
        .addEventListener("click", function (event) {
          event.preventDefault();
          let selectElement = document.getElementById("quizSelect");
          state.quiz = state.quizzes.find(
            (quiz) =>
              quiz.name ===
              selectElement.options[selectElement.selectedIndex].value
          );
          state.name = document.getElementById("nameInput").value;
          state.page = "quiz";
          render();
        });
      break;
    case "quiz":
      fetch(
        `https://my-json-server.typicode.com/Alegacki21/CUS1172_Project3/questions`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((questions) => {
          const quizQuestions = questions.filter(
            (question) => question.quizId === state.quiz.id
          );
          state.quiz.questions = quizQuestions; 
          state.currentQuestion = quizQuestions[state.questionIndex];
          app.innerHTML = quizTemplate(state);
          document
            .getElementById("quizForm")
            .addEventListener("submit", handleQuiz);
        })
        .catch((error) => {
          console.log("Fetch failed:", error);
        });
      break;

    case "feedback":
      app.innerHTML = feedbackTemplate(state);
      new Promise((resolve) => setTimeout(resolve, 3000)).then(() => {
        if (state.questionIndex >= state.quiz.questions.length - 1) {
          state.page = "result";
          state.total = state.quiz.questions.length;
          state.resultMessage =
            state.score / state.total >= 0.8
              ? "Congratulations! You passed the quiz."
              : "Sorry, you failed the quiz.";
        } else {
          state.page = "quiz";
        }
        render();
      });
      break;

    case "result":
      state.total = state.quiz.questions.length;
      state.percentage = (state.score / state.total) * 100;
      state.resultMessage =
        state.percentage >= 80
          ? "Congratulations! You passed the quiz."
          : "Sorry, you failed the quiz.";

      const source = document.getElementById("result-template").innerHTML;

      const template = Handlebars.compile(source);

      const resultHTML = template({
        name: state.name,
        score: state.score,
        total: state.total,
        percentage: state.percentage,
        resultMessage: state.resultMessage,
      });

      document.getElementById("app").innerHTML = resultHTML;

      document
        .getElementById("restartQuiz")
        .addEventListener("click", function () {
          state.page = "quiz";
          state.questionIndex = 0;
          state.score = 0;
          state.currentQuestion = state.quiz.questions[state.questionIndex];
          render();
        });
      document.getElementById("goHome").addEventListener("click", function () {
        state.page = "start";
        state.quiz = null;
        state.questionIndex = 0;
        state.score = 0;
        state.currentQuestion = null;
        render();
      });

      break;
  }
}
function handleMainPage() {
  state.page = "start";
  render();
}

function handleQuiz(event) {
  event.preventDefault();
  let answer;
  if (
    state.currentQuestion.type === "multipleChoice" ||
    state.currentQuestion.type === "image"
  ) {
    answer = document.querySelector('input[name="answer"]:checked').value;
  } else if (state.currentQuestion.type === "text") {
    answer = document.querySelector('input[name="answer"]').value;
  }
  if (answer === state.currentQuestion.correctAnswer) {
    state.score++;
    state.feedbackMessage = "Brilliant!";
  } else {
    state.feedbackMessage = `Sorry, the correct answer is ${state.currentQuestion.correctAnswer}.`;
  }
  const percentage = (state.score / 5) * 100;
  if (percentage > 80) {
    state.resultMessage = `Congratulations ${state.name}! You pass the quiz.`;
  } else {
    state.resultMessage = `Sorry ${state.name}, you fail the quiz.`;
  }
  state.page = "feedback";
  render();
  setTimeout(function () {
    state.page = "quiz";
    handleNextQuestion();
    render();
  }, 3000);
}

function handleNextQuestion() {
  state.questionIndex++;
  if (state.questionIndex < state.quiz.questions.length) {
    state.currentQuestion = state.quiz.questions[state.questionIndex];
    state.page = "quiz";
  } else {
    state.page = "result";
    state.total = state.quiz.questions.length;
    state.percentage = (state.score / state.total) * 100;
    state.resultMessage =
      state.percentage >= 80
        ? "Congratulations! You passed the quiz."
        : "Sorry, you failed the quiz.";
  }
  render();
}

function handleRetakeQuiz() {
  state.score = 0;
  state.questionIndex = 0;
  state.page = "quiz";
  fetch(
    `https://my-json-server.typicode.com/Alegacki21/CUS1172_Project3/questions`
  )
    .then((response) => response.json())
    .then((questions) => {
      const quizQuestions = questions.filter(
        (question) => question.quizId === state.quiz.id
      );
      state.currentQuestion = quizQuestions[state.questionIndex];
      render();
    });
}
