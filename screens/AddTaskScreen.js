import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TaskCard from '../components/TaskCard';

export default function AddTaskScreen() {
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [quote, setQuote] = useState("Loading today's motivation...");

  // Load saved tasks when the screen starts
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

  // Save tasks whenever they change
  useEffect(() => {
    if (!isLoaded) return;

    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Failed to save tasks:', error);
      }
    };

    saveTasks();
  }, [tasks, isLoaded]);

  // Fetch a quote when the screen loads
  useEffect(() => {
    fetch('https://api.quotable.io/random')
      .then((response) => response.json())
      .then((data) => setQuote(data.content))
      .catch(() => {
        setQuote('Believe in yourself and get it done!');
      });
  }, []);

  // Add a new task
  function handleAddTask() {
    if (taskText.trim() === '') {
      setErrorMessage('Please type a task before adding it.');
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

  // Mark a task as done or pending
  function handleToggleTask(id) {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      )
    );
  }

  // Delete a task
  function handleDeleteTask(id) {
    setTasks(tasks.filter((t) => t.id !== id));
  }

  // Get a new quote
  function getNewQuote() {
    fetch('https://api.quotable.io/random')
      .then((response) => response.json())
      .then((data) => {
        setQuote(data.content);
      })
      .catch(() => {
        setQuote('Believe in yourself and get it done!');
      });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.quote}>💬 {quote}</Text>

      <Button title="New Quote" onPress={getNewQuote} />

      <Text style={styles.heading}>Add a Task</Text>

      <TextInput
        style={styles.input}
        placeholder="What do you need to do?"
        value={taskText}
        onChangeText={setTaskText}
      />

      {errorMessage !== '' && (
        <Text style={styles.error}>{errorMessage}</Text>
      )}

      <Button title="Add Task" onPress={handleAddTask} />

      <Text style={styles.counter}>
        You have {tasks.length} task(s)
      </Text>

      {tasks.length > 0 && tasks.every((t) => t.done) && (
        <Text style={styles.celebration}>
          🎉 All done! Great work!
        </Text>
      )}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            title={item.title}
            done={item.done}
            onToggle={() => handleToggleTask(item.id)}
            onDelete={() => handleDeleteTask(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No tasks yet — add one above! 👆
          </Text>
        }
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
        style={styles.list}
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

  quote: {
    fontStyle: 'italic',
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },

  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
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

  counter: {
    marginTop: 16,
  },

  celebration: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E8A7A',
    textAlign: 'center',
    marginVertical: 12,
  },

  empty: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 24,
  },

  separator: {
    height: 8,
  },

  list: {
    marginTop: 16,
  },
});