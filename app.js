const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
  try {
    const image = await Jimp.read(inputFile);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const textData = {
      text: text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };

    image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
    image.quality(100).write(outputFile);

    console.log('Adding watermark finished with success!');
    startApp();
  } catch(error) {
    console.log(error);
  }
};

const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
  try {
    const image = await Jimp.read(inputFile);
    const watermark = await Jimp.read(watermarkFile);
    const x = image.getWidth() / 2 - watermark.getWidth() / 2;
    const y = image.getHeight() / 2 - watermark.getHeight() / 2;

    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
    });

    image.quality(100).write(outputFile);

    console.log('Adding watermark finished with success!');
    startApp();
  }
  catch(error) {
    console.log(error);
  }
};

const addWatermark = async function(inputFile, outputFile) {

}

const brightenImage = async function(inputFile) {
  const image = await Jimp.read(inputFile);

  const value = await inquirer.prompt([{
    name: 'brightnessValue',
    type: 'list',
    choices: ['Brighten gently', 'Give me a lot of bright!'],
  }]);

  if (value.brightnessValue === 'Brighten gently') {
    image.brightness(0.1);
  } else {
    image.brightness(0.5);
  }

  image.quality(100).write(inputFile);
};

const increaseContrast = async function(inputFile, value) {
  const image = await Jimp.read(inputFile);
  image.contrast(value);

  image.quality(100).write(inputFile);
};

const makeGreyscale = async function(inputFile) {
  const image = await Jimp.read(inputFile);
  image.greyscale();

  image.quality(100).write(inputFile);
};

const prepareOutputFilename = fileName => {
  const newFileName = fileName.split('.').join('-with-watermark.');
  return newFileName;
};

const startApp = async () => {
  const answer = await inquirer.prompt([{
    name: 'start',
    message: 'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
    type: 'confirm',
  }]);

  if (!answer.start) process.exit();

  const options = await inquirer.prompt([{
    name: 'inputImage',
    type: 'input',
    message: 'What file do you want to mark?',
    default: 'test.jpg',
  }, {
    name: 'edition',
    message: 'Do you want to edit your picture?',
    type: 'confirm',
  }]);

  if (options.edition) {
    const editionOptions = await inquirer.prompt([{
      name: 'editionType',
      type: 'list',
      choices: ['Brighten', 'Increase contrast', 'Make image b&w', 'Invert image'],
    }]);

    if (editionOptions.editionType === 'Brighten') {
      await brightenImage(`./img/${options.inputImage}`);
    }

    if (editionOptions.editionType === 'Increase contrast') {
      await increaseContrast(`./img/${options.inputImage}`, 0.2);
    }

    if (editionOptions.editionType === 'Make image b&w') {
      await makeGreyscale(`./img/${options.inputImage}`);
    }

  }
  const watermark = await inquirer.prompt([{
    name: 'watermarkType',
    type: 'list',
    choices: ['Text watermark', 'Image watermark'],
  }]);

  if (watermark.watermarkType === 'Text watermark') {
    const text = await inquirer.prompt([{
      name: 'value',
      type: 'input',
      message: 'Type your watermark text:',
    }]);

    watermark.watermarkText = text.value;

    if (fs.existsSync(`./img/${options.inputImage}`)) {
      addTextWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), watermark.watermarkText);
    } else {
      console.log('Something went wrong... Try again');
    }
  } else {
    const image = await inquirer.prompt([{
      name: 'filename',
      type: 'input',
      message: 'Type your watermark name:',
      default: 'logo.png',
    }]);

    watermark.watermarkImage = image.filename;

    if (fs.existsSync(`./img/${options.inputImage}`) && fs.existsSync(`./img/${watermark.watermarkImage}`)) {
        addImageWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), './img/' + watermark.watermarkImage);
    } else {
      console.log('Something went wrong... Try agaian');
    }
  }
};

startApp();
