import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { TextInput, Button, Snackbar, PaperProvider, Card, Title, IconButton } from 'react-native-paper';
import { AsyncStorage } from 'react-native';

export default function App() {
  const [text, setText] = useState("");
  const [cuentas, setCuentas] = useState([]);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    getData()
  }, [])


  function evaluarCodigoEnCorchetes(texto) {
    const resultado = texto.replace(/\[(.*?)\]/g, (match, codigo) => {
      try {
        return new Function(`return ${codigo}`)();
      } catch (error) {
        console.error(`Error al evaluar el código "${codigo}":`, error);
        return match; // Devolver el código original en caso de error
      }
    });

    return resultado;
  }

  const onToggleSnackBar = () => setVisible(!visible);

  const onDismissSnackBar = () => setVisible(false);

  const saveCuentas = async () => {
    const cuentasData = [...cuentas, { cuenta: evaluarCodigoEnCorchetes(text) }]
    setCuentas(cuentasData)
    console.log(cuentasData)
    await setData('cuentas', cuentasData)
    setText("")
    onToggleSnackBar()
  }

  const borrarCuentas = async (id) => {
    let nuevoArray = cuentas.filter((elemento, index) => index !== id);
    setCuentas(nuevoArray)
    console.log(nuevoArray)
    await setData('cuentas', nuevoArray)
  }

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('cuentas');
      console.log(value, 'get')
      setCuentas(JSON.parse(value) || [])
      if (value !== null) {
        // We have data!!
        console.log(value);
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  const setData = async (clave, valor) => {
    try {
      await AsyncStorage.setItem(
        clave,
        valor,
      );
    } catch (error) {
      // Error saving data
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text>Usa [ ] para evaluar codigo js</Text>
        <TextInput
          label="Crear Nota"
          value={text}
          onChangeText={text => setText(text)}
        />
        <Button style={{ marginTop: 5 }} mode="contained" onPress={saveCuentas}>
          Crear
        </Button>
        <ScrollView>
          {cuentas.reverse().map((detalle, index) => {
            return (
              <Card key={index} style={{ marginTop: 8 }}>
                <Card.Content>
                  <Title>{detalle.cuenta}</Title>
                  <IconButton
                    icon="delete"
                    size={25}
                    onPress={() => borrarCuentas(index)}
                  />
                </Card.Content>
              </Card>
            )
          })}
        </ScrollView>
      </View>
      <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
      >
        Nota Creada
      </Snackbar>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginTop: 30,
    padding: 5,
    height: '95%'
  },
});
