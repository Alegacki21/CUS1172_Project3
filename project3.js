let state = {
  page: "start",
  name: "",
  quiz: null,
  score: 0,
  questionIndex: 0,
  quizzes: [],
};

let app;
let startTemplate, quizTemplate, feedbackTemplate, resultTemplate;
  
document.addEventListener('DOMContentLoaded', function() {
    app = document.getElementById('app');
    state.quizzes = [
        { id: 1, name: 'Quiz 1' },
        { id: 2, name: 'Quiz 2' },
    ];
  
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

      const startForm = document.getElementById("startForm");
      const quizForm = document.getElementById("quizForm");
    
      startForm.addEventListener("submit", startQuiz);
      quizForm.addEventListener("submit", handleQuiz);
      
});
      
function render() {
    switch (state.page) {
      case "start":
        app.innerHTML = startTemplate(state);
        setTimeout(function() {
          const startForm = document.getElementById("startForm");
          startForm.addEventListener("submit", startQuiz);
          document.getElementById('start-quiz-button').addEventListener('click', function(event) {
            event.preventDefault();
            let selectElement = document.getElementById("quizSelect");
            state.quiz = state.quizzes.find(quiz => quiz.name === selectElement.options[selectElement.selectedIndex].value);
            state.page = 'quiz';
            render();
          });
        }, 0);
        break;
      case "quiz":
        fetch(`https://my-json-server.typicode.com/Alegacki21/CUS1172_Project3/quizzes/${state.quiz.id}/questions/${state.questionIndex}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((question) => {
            state.currentQuestion = question;
            app.innerHTML = quizTemplate(state);
            setTimeout(function() {
              const quizForm = document.getElementById("quizForm");
              quizForm.addEventListener("submit", handleQuiz);
            }, 0);
          })
          .catch((error) => {
            console.log('Fetch failed:', error);
          });
        break;
    case "feedback":
      app.innerHTML = feedbackTemplate(state);
      document
        .getElementById("nextQuestion")
        .addEventListener("click", handleNextQuestion);
      break;
    case "end":
      const percentage = (state.score / 5) * 100;
      if (percentage > 80) {
        state.resultMessage = `Congratulations ${state.name}! You pass the quiz.`;
      } else {
        state.resultMessage = `Sorry ${state.name}, you fail the quiz.`;
      }
      app.innerHTML = resultTemplate(state);
      document
        .getElementById("retakeQuiz")
        .addEventListener("click", handleRetakeQuiz);
      document
        .getElementById("mainPage")
        .addEventListener("click", handleMainPage);
      break;
  }
}

function handleMainPage() {
    state.page = "start";
    render();
    
  }

function startQuiz(event) {
  event.preventDefault();
  state.name = document.getElementById("nameInput").value;
  state.quiz = document.getElementById("quizSelect").value;
  state.page = "quiz";
  fetch(
    `https://my-json-server.typicode.com/Alegacki21/CUS1172_Project3/quizzes/${state.quiz}/questions/0`
  )
    .then((response) => response.json())
    .then((question) => {
      state.currentQuestion = question;
      state.page = "quiz";
      render();
    });
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
  state.page = "feedback";
  render();
  setTimeout(() => {
    state.questionIndex++;
    if (state.questionIndex < 5) {
      fetch(
        `https://my-json-server.typicode.com/Alegacki21/CUS1172_Project3/quizzes/${state.quiz}/questions/${state.questionIndex}`
      )
        .then((response) => response.json())
        .then((question) => {
          state.currentQuestion = question;
          state.page = "quiz";
          render();
        });
    } else {
      state.page = "end";
      render();
    }
  }, 1000);
}


function handleNextQuestion() {
  state.questionIndex++;
  if (state.questionIndex < 5) {
    fetch(
      `https://my-json-server.typicode.com/Alegacki21/CUS1172_Project3/quizzes/${state.quiz}/questions/${state.questionIndex}`
    )
      .then((response) => response.json())
      .then((question) => {
        state.currentQuestion = question;
        state.page = "quiz";
        render();
      });
  } else {
    state.page = "end";
    render();
  }
}

function handleRetakeQuiz() {
  state.score = 0;
  state.questionIndex = 0;
  state.page = "quiz";
  fetch(
    `https://my-json-server.typicode.com/Alegacki21/CUS1172_Project3/quizzes/${state.quiz}/questions/0`
  )
    .then((response) => response.json())
    .then((question) => {
      state.currentQuestion = question;
      render();
    });
}


