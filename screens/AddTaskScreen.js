import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
} from 'react-native';
import TaskCard from '../components/TaskCard';

export default function AddTaskScreen() {
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  const [quote, setQuote] = useState(
    "Loading today's motivation..."
  );

  // =========================
  // LAB 8 - LOAD SAVED TASKS
  // =========================
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedData = await AsyncStorage.getItem('tasks');

        if (savedData !== null) {
          setTasks(JSON.parse(savedData));
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTasks();
  }, []);

  // =========================
  // LAB 8 - SAVE TASKS
  // =========================
  useEffect(() => {
    if (!isLoaded) return;

    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem(
          'tasks',
          JSON.stringify(tasks)
        );
      } catch (error) {
        console.error('Failed to save tasks:', error);
      }
    };

    saveTasks();
  }, [tasks, isLoaded]);

  // =========================
  // LAB 9 - GET QUOTE
  // =========================
  useEffect(() => {
    fetch('https://api.quotable.io/random')
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `HTTP error! Status: ${response.status}`
          );
        }

        return response.json();
      })
      .then((data) => {
        setQuote(data.content);
      })
      .catch((error) => {
        console.error('API ERROR:', error);

        setQuote(
          'Believe in yourself and get it done!'
        );
      });
  }, []);

  // =========================
  // ADD TASK
  // =========================
  function handleAddTask() {
    if (taskText.trim() === '') {
      setErrorMessage(
        'Please type a task before adding it.'
      );
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title: taskText,
      done: false,
    };

    setTasks([...tasks, newTask]);
    setTaskText('');
    setErrorMessage('');
  }

  // =========================
  // TOGGLE TASK
  // =========================
  function handleToggleTask(id) {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? { ...t, done: !t.done }
          : t
      )
    );
  }

  // =========================
  // LAB 9 - NEW QUOTE
  // =========================
  function getNewQuote() {
    setQuote('Loading new quote...');

    fetch('https://api.quotable.io/random')
      .then((response) => {
        console.log(
          'API response status:',
          response.status
        );

        if (!response.ok) {
          throw new Error(
            `HTTP error! Status: ${response.status}`
          );
        }

        return response.json();
      })
      .then((data) => {
        console.log('API data:', data);

        setQuote(data.content);
      })
      .catch((error) => {
        console.error('API ERROR:', error);

        setQuote(
          'Believe in yourself and get it done!'
        );
      });
  }

  return (
    <View style={styles.container}>

      {/* TITLE */}
      <Text style={styles.heading}>
        Add a Task
      </Text>

      {/* TASK COUNT */}
      <Text>
        You have {tasks.length} task(s)
      </Text>

      {/* INPUT */}
      <TextInput
        style={styles.input}
        placeholder="What do you need to do?"
        value={taskText}
        onChangeText={setTaskText}
      />

      {/* VALIDATION ERROR */}
      {errorMessage !== '' && (
        <Text style={styles.error}>
          {errorMessage}
        </Text>
      )}

      {/* ADD TASK BUTTON */}
      <Button
        title="Add Task"
        onPress={handleAddTask}
      />

      {/* MOTIVATIONAL QUOTE */}
      <Text style={styles.quote}>
        💬 {quote}
      </Text>

      {/* NEW QUOTE BUTTON */}
      <Button
        title="New Quote"
        onPress={getNewQuote}
      />

      {/* CELEBRATION MESSAGE */}
      {tasks.length > 0 &&
        tasks.every((t) => t.done) && (
          <Text style={styles.celebration}>
            🎉 All done! Great work!
          </Text>
        )}

      {/* TASK LIST */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}

        renderItem={({ item }) => (
          <TaskCard
            title={item.title}
            done={item.done}
            onToggle={() =>
              handleToggleTask(item.id)
            }
          />
        )}

        style={styles.list}

        ListEmptyComponent={
          <Text style={styles.empty}>
            No tasks yet — add one above! 👆
          </Text>
        }

        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },

  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: '#D8DEE9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },

  error: {
    color: '#B23A48',
    marginBottom: 10,
  },

  quote: {
    fontStyle: 'italic',
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },

  celebration: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E8A7A',
    textAlign: 'center',
    marginVertical: 12,
  },

  list: {
    marginTop: 16,
  },

  empty: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 24,
  },

  separator: {
    height: 8,
  },
});