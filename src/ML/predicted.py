import joblib
import pandas as pd

# Load the trained model
model = joblib.load("student_performance_model.joblib")


def predict_performance(student_data):
    # Convert input data into a DataFrame
    data = pd.DataFrame([student_data])

    # Make prediction
    prediction = model.predict(data)

    return prediction[0]


# Test prediction
student = {
    "subject": "DBMS",
    "topic": "SQL",
    "study_hours": 2.0,
    "quiz_score": 45,
    "previous_score": 50,
    "attempts": 2,
    "time_taken": 10,
    "days_to_exam": 7,
    "last_studied_days": 4,
    "topic_difficulty": "Medium"
}

result = predict_performance(student)

print("Predicted Performance:", result)