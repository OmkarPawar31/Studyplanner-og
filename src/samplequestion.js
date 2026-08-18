// sampleQuestions.js
// TEMPORARY fake data — will be replaced by real ML model output later

export const sampleQuestions = {
    python: [
        {
            id: 1,
            question: "What does the 'len()' function do in Python?",
            options: [
                "Returns the length of an object",
                "Deletes a variable",
                "Converts to lowercase",
                "Rounds a number",
            ],
            correctAnswer: "Returns the length of an object",
        },
        {
            id: 2,
            question: "Which keyword is used to define a function in Python?",
            options: ["func", "def", "function", "lambda"],
            correctAnswer: "def",
        },
        {
            id: 3,
            question: "What is the output of: print(type([]))?",
            options: ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "<class 'dict'>"],
            correctAnswer: "<class 'list'>",
        },
        {
            id: 4,
            question: "Which of these is immutable in Python?",
            options: ["List", "Dictionary", "Tuple", "Set"],
            correctAnswer: "Tuple",
        },
        {
            id: 5,
            question: "What does 'DSA' stand for?",
            options: [
                "Data Structures and Algorithms",
                "Digital Software Architecture",
                "Data Science Applications",
                "Dynamic System Analysis",
            ],
            correctAnswer: "Data Structures and Algorithms",
        },
    ],
};