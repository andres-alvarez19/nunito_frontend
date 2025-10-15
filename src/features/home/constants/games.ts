export interface GameDefinition {
  id: string;
  name: string;
  description: string;
  color: 'mint' | 'pastel' | 'violet' | 'blue';
  demoImage: any;
}

export const gameDefinitions: GameDefinition[] = [
  {
    id: 'image-word',
    name: 'Asociación Imagen-Palabra',
    description: 'Relaciona imágenes con la palabra correcta.',
    color: 'mint',
    demoImage: require('../../../../assets/images/gato-naranja-sentado.jpg'),
  },
  {
    id: 'syllable-count',
    name: 'Conteo de Sílabas',
    description: 'Cuenta las sílabas de cada palabra mostrada.',
    color: 'pastel',
    demoImage: require('../../../../assets/images/pelota-roja-redonda.jpg'),
  },
  {
    id: 'rhyme-identification',
    name: 'Identificación de Rimas',
    description: 'Encuentra palabras que riman entre sí.',
    color: 'violet',
    demoImage: require('../../../../assets/images/flor-rosa-bonita.jpg'),
  },
  {
    id: 'audio-recognition',
    name: 'Reconocimiento Auditivo',
    description: 'Escucha y selecciona la palabra correcta.',
    color: 'blue',
    demoImage: require('../../../../assets/images/mariposa-colorida-volando.jpg'),
  },
];
