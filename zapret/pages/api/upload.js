import formidable from 'formidable';
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'secret123';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка обработки формы' });
    }

    const password = Array.isArray(fields.password) ? fields.password[0] : fields.password;
    if (password !== ADMIN_PASSWORD) {
      return res.status(403).json({ error: 'Неверный пароль' });
    }

    const fileField = files.file;
    const uploadedFile = Array.isArray(fileField) ? fileField[0] : fileField;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'Файл не найден' });
    }

    try {
      const botToken = process.env.TG_BOT_TOKEN;
      const chatId = process.env.TG_CHAT_ID;

      if (!botToken || !chatId) {
        return res.status(500).json({ error: 'Не настроены переменные Telegram' });
      }

      const fileStream = fs.createReadStream(uploadedFile.filepath);
      const tgFormData = new FormData();
      tgFormData.append('chat_id', chatId);
      tgFormData.append('document', fileStream, uploadedFile.originalFilename);

      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
        method: 'POST',
        body: tgFormData,
      });

      const tgData = await tgRes.json();
      if (!tgData.ok) {
        throw new Error('Ошибка Telegram API');
      }

      const fileId = tgData.result.document.file_id;
      const fileMetaRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
      const fileMetaData = await fileMetaRes.json();
      const filePath = fileMetaData.result.file_path;
      const directUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;

      return res.status(200).json({ url: directUrl });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Ошибка при отправке файла' });
    }
  });
}
