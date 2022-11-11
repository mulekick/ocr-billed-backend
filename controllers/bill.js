const { Bill } = require('../models');

// !!! fix image resources serving !!!
/* eslint-disable operator-linebreak, arrow-parens, max-len, array-bracket-spacing, quotes, indent, no-confusing-arrow */
const getFileURL = f => [
    `null`,
    `public/4b392f446047ced066990b0627cfa444`,
    `public/976fbc50929ab2852a517ff682c603f5`,
    `public/f8021afdeed2f9305e7120ae3af43383`,
    `public/85026075b4d16cccb1a23011251f5c81` ].includes(f) ?
        // - some images are missing from the bills that are initially in the database, so a default image is served
        `https://media.tenor.com/Ta_hcuLCfCAAAAAC/%E4%BD%95%E3%82%82%E3%81%AA%E3%81%84-%E3%83%8A%E3%83%83%E3%82%B7%E3%83%B3%E3%82%B0.gif` :
        // - I run the backend on a virtual machine (192.168.1.12) and not on localhost
        `http://localhost:5678/${f}`.replace(`localhost`, `192.168.1.12`);

// const getFileURL = (filePath) => `http://localhost:5678/${filePath}`;
// !!! fix image resources serving !!!

const isPicture = (mimeType) => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(mimeType);

const create = async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).send({ message: 'user must be authenticated' });
  try {
    const {
      name,
      type,
      email,
      date,
      vat,
      pct,
      commentary,
      status,
      commentAdmin,
      amount,
    } = req.body;
    const { file } = req;
    const bill = await Bill.create({
      name,
      type,
      email,
      date,
      vat,
      pct,
      commentary,
      status,
      commentAdmin,
      fileName: isPicture(file.mimetype) ? file.originalname : 'null',
      filePath: isPicture(file.mimetype) ? file.path : 'null',
      amount,
    });
    return res.status(201).json(bill);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const get = async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).send({ message: 'user must be authenticated' });
  try {
    const bill = user.type === 'Admin'
      ? await Bill.findOne({ where: { key: req.params.id } })
      : await Bill.findOne({
        where: { key: req.params.id, email: user.email },
      });
    if (!bill) return res.status(401).send({ message: 'unauthorized action' });
    const {
      key: id,
      name,
      type,
      email,
      date,
      vat,
      pct,
      commentary,
      status,
      commentAdmin,
      fileName,
      amount,
      filePath,
    } = bill;
    return res.json({
      id,
      name,
      type,
      email,
      date,
      vat,
      pct,
      commentary,
      status,
      commentAdmin,
      fileName,
      fileUrl: getFileURL(filePath),
      amount,
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const list = async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).send({ message: 'user must be authenticated' });
  try {
    const bills = user.type === 'Admin'
      ? await Bill.findAll()
      : await Bill.findAll({ where: { email: user.email } });
    return res.json(
      bills.map(
        ({
          key: id,
          name,
          type,
          email,
          date,
          vat,
          pct,
          commentary,
          status,
          commentAdmin,
          fileName,
          amount,
          filePath,
        }) => ({
          id,
          name,
          type,
          email,
          date,
          vat,
          pct,
          commentary,
          status,
          commentAdmin,
          fileName,
          amount,
          fileUrl: getFileURL(filePath),
        }),
      ),
    );
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const update = async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).send({ message: 'user must be authenticated' });
  try {
    const {
      name,
      type,
      email,
      date,
      vat,
      pct,
      commentary,
      status,
      commentAdmin,
      amount,
    } = req.body;
    const toUpdate = {
      name,
      type,
      email,
      date,
      vat,
      pct,
      commentary,
      status,
      commentAdmin,
      amount,
    };
    const bill = user.type === 'Admin'
      ? await Bill.findOne({ where: { key: req.params.id } })
      : await Bill.findOne({
        where: { key: req.params.id, email: user.email },
      });
    if (!bill) return res.status(401).send({ message: 'unauthorized action' });
    const updated = await bill.update(toUpdate);
    return res.json(updated);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
const remove = async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).send({ message: 'user must be authenticated' });
  try {
    const bill = user.type === 'Admin'
      ? await Bill.findOne({ where: { key: req.params.id } })
      : await Bill.findOne({
        where: { key: req.params.id, email: user.email },
      });
    if (!bill) return res.status(401).send({ message: 'unauthorized action' });
    await Bill.destroy({ where: { id: bill.id } });
    return res.send('Bill removed');
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

module.exports = {
  list,
  get,
  create,
  update,
  remove,
};
