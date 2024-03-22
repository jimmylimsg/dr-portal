const express = require('express');
const cors = require('cors');
const app = express();
const port = 3003;

app.use(express.json());
app.use(cors());

app.get('/get_dr_doc_dfc', async function(req, res) {
  try {
	var req_visit_no = req.query.smc_no;
	console.log('SMC No: ', req_visit_no);
	
	if (req_visit_no) {
	  let result = await RunDB(req_visit_no);
	  console.log('Result:');
      console.log(result);	  
	  
	  if (result) {
		if (result.length > 0) {
	      //res.type('application/json');
		  //res.status(200).send(result);
          //res.sendStatus(200);
		  res.status(200).json({ status: 'success', rows: result.length, data: result});
		}
		else {
          res.status(200).json({ status: 'success', rows: 0, data: {} });  		  
		};
	  }
	  else {
		res.status(500).json({ status: 'failed', err_code: 0, err_msg: 'Data cannot be retrieved.' });
	  };
    }
	else {
	  res.status(500).json({ status: 'failed', err_code: -1, err_msg: 'Visit No was not supplied.' });
	};
	return;
  }
  catch (error) {
	console.log('Service Error: ', error);
  }
});

let connection;
var oracledb = require('oracledb');

async function RunDB(visit_no) {
  try {
	//console.log('Visit No: ', visit_no);  
	visit_no = 'I140025278';
	if (!visit_no) {
	  return;
	};
	//console.log("Is Thin Mode: ", oracledb.thin);
    connection = await oracledb.getConnection({
      user          : "ihis",
      password      : "ihis",
      connectString : "10.250.96.52:1530/IHISSIT2"
    }); 
    console.log("Successfully connected to Oracle!");
	const sqlQuery = "SELECT DOC_SMC_NO, DOC_NAME, DOC_TYPE FROM TABLE(HISLIB_PORTAL.GET_DOCTOR_LIST_AS_TBL(:VISIT_NO))";
	//console.log(sqlQuery);
    let result = await connection.execute(
	  sqlQuery, 
	  [visit_no],
	  { outFormat: oracledb.OUT_FORMAT_OBJECT }
	);
    //console.log('Result Length: ', result.rows.length);
    //console.log('Result: ', result.rows);
    result.rows =
	[
	  {
		"DOC_REF_NO":"DFC0001",
        "DISCHARGE_DATE":"21/08/2023",
        "VISIT_NO":"ALL",
        "PATIENT_NAME":"ALL",
        "CLINIC_NAME":"C12345",
		"ONBASE_DOC_REF_NO":"ONBASE0001"			
	  },
	  {
		"DOC_REF_NO":"DFC0002",
        "DISCHARGE_DATE":"22/08/2023",
        "VISIT_NO":"ALL",
        "PATIENT_NAME":"ALL",
        "CLINIC_NAME":"C12345",
		"ONBASE_DOC_REF_NO":"ONBASE0002"			
	  },
	  {
	    "DOC_REF_NO":"DFC0003",
        "DISCHARGE_DATE":"23/08/2023",
        "VISIT_NO":"ALL",
        "PATIENT_NAME":"ALL",
        "CLINIC_NAME":"C12345",
		"ONBASE_DOC_REF_NO":"ONBASE0003"			
	  }		  
	];
	
    if (result) {
	  console.log('Result fetched successfully!');
	  return result.rows;
	}
	else {
	  return null;	
	};
  } catch (error) {
    console.log("DB Error: ", error);
  } finally {
    if (connection) {
      try {
        await connection.close();
		console.log("Successfully close the database connection!");
      } catch (error) {
        console.log("DB Error When Closing: ", error);
      }
    }
  }
};  

app.listen(port, () => console.log(`Doctor Portal Service is listening on port ${port}!`));
