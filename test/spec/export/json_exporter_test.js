'use strict';

const expect = require('chai').expect,
  fs = require('fs'),
  fail = expect.fail,
  Exporter = require('../../../lib/export/json_exporter'),
  JDLParser = require('../../../lib/parser/jdl_parser'),
  EntityParser = require('../../../lib/parser/entity_parser'),
  parseFromFiles = require('../../../lib/reader/jdl_reader').parseFromFiles;

describe('::exportToJSON', () => {
  describe('when passing invalid parameters', () => {
    describe('such as undefined', () => {
      it('throws an error', () => {
        try {
          Exporter.exportToJSON();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
  });
  describe('when passing valid arguments', () => {
    describe('when exporting JDL to entity json for SQL type', () => {
      const input = parseFromFiles(['./test/test_files/complex_jdl.jdl']);
      const content = EntityParser.parse({
        jdlObject: JDLParser.parse(input, 'sql'),
        databaseType: 'sql'
      });
      Exporter.exportToJSON(content);
      const department = JSON.parse(fs.readFileSync('.jbooter/Department.json', {encoding: 'utf-8'}));
      const jobHistory = JSON.parse(fs.readFileSync('.jbooter/JobHistory.json', {encoding: 'utf-8'}));
      it('exports it', () => {
        expect(fs.statSync('.jbooter/Department.json').isFile()).to.be.true;
        expect(fs.statSync('.jbooter/JobHistory.json').isFile()).to.be.true;
        expect(fs.statSync('.jbooter/Job.json').isFile()).to.be.true;
        expect(fs.statSync('.jbooter/Employee.json').isFile()).to.be.true;
        expect(fs.statSync('.jbooter/Location.json').isFile()).to.be.true;
        expect(fs.statSync('.jbooter/Task.json').isFile()).to.be.true;
        expect(fs.statSync('.jbooter/Country.json').isFile()).to.be.true;
        expect(fs.statSync('.jbooter/Region.json').isFile()).to.be.true;
        expect(department.relationships).to.deep.eq([
          {
            "relationshipType": "one-to-one",
            "relationshipName": "location",
            "otherEntityName": "location",
            "otherEntityField": "id",
            "ownerSide": true,
            "otherEntityRelationshipName": "department"
          },
          {
            "relationshipType": "one-to-many",
            "javadoc": "A relationship",
            "relationshipName": "employee",
            "otherEntityName": "employee",
            "otherEntityRelationshipName": "department"
          }
        ]);
        expect(department.fields).to.deep.eq([
          {
            "fieldName": "departmentId",
            "fieldType": "Long"
          },
          {
            "fieldName": "departmentName",
            "fieldType": "String",
            "fieldValidateRules": ["required"]
          }
        ]);
        expect(department.dto).to.eq('no');
        expect(department.service).to.eq('no');
        expect(department.pagination).to.eq('no');
        expect(jobHistory.relationships).to.deep.eq([
          {
            "relationshipType": "one-to-one",
            "relationshipName": "department",
            "otherEntityName": "department",
            "otherEntityField": "id",
            "ownerSide": true,
            "otherEntityRelationshipName": "jobHistory"
          },
          {
            "relationshipType": "one-to-one",
            "relationshipName": "job",
            "otherEntityName": "job",
            "otherEntityField": "id",
            "ownerSide": true,
            "otherEntityRelationshipName": "jobHistory"
          },
          {
            "relationshipType": "one-to-one",
            "relationshipName": "employee",
            "otherEntityName": "employee",
            "otherEntityField": "id",
            "ownerSide": true,
            "otherEntityRelationshipName": "jobHistory"
          }
        ]);
        expect(jobHistory.fields).to.deep.eq([
          {
            "fieldName": "startDate",
            "fieldType": "ZonedDateTime"
          },
          {
            "fieldName": "endDate",
            "fieldType": "ZonedDateTime"
          },
          {
            "fieldName": "language",
            "fieldType": "Language",
            "fieldValues": "FRENCH,ENGLISH,SPANISH"
          }
        ]);
        expect(jobHistory.dto).to.eq('no');
        expect(jobHistory.service).to.eq('no');
        expect(jobHistory.pagination).to.eq('infinite-scroll');
        // clean up the mess...
        fs.unlinkSync('.jbooter/Department.json');
        fs.unlinkSync('.jbooter/JobHistory.json');
        fs.unlinkSync('.jbooter/Job.json');
        fs.unlinkSync('.jbooter/Employee.json');
        fs.unlinkSync('.jbooter/Location.json');
        fs.unlinkSync('.jbooter/Task.json');
        fs.unlinkSync('.jbooter/Country.json');
        fs.unlinkSync('.jbooter/Region.json');
        fs.rmdirSync('.jbooter');
      });
    });
    describe('when exporting JDL to entity json for an existing entity', () => {
      let input = parseFromFiles(['./test/test_files/valid_jdl.jdl']);
      let content = EntityParser.parse({
        jdlObject: JDLParser.parse(input, 'sql'),
        databaseType: 'sql'
      });
      it('exports it with same changeLogDate', function (done) {
        Exporter.exportToJSON(content);
        expect(fs.statSync('.jbooter/A.json').isFile()).to.be.true;
        const changeLogDate = JSON.parse(fs.readFileSync('.jbooter/A.json', {encoding: 'utf-8'})).changelogDate;
        setTimeout(() => {
          input = parseFromFiles(['./test/test_files/valid_jdl.jdl']);
          content = EntityParser.parse({
            jdlObject: JDLParser.parse(input, 'sql'),
            databaseType: 'sql'
          });
          Exporter.exportToJSON(content, true);
          expect(fs.statSync('.jbooter/A.json').isFile()).to.be.true;
          const newChangeLogDate = JSON.parse(fs.readFileSync('.jbooter/A.json', {encoding: 'utf-8'})).changelogDate;
          expect(newChangeLogDate).to.eq(changeLogDate);
          // clean up the mess...
          fs.unlinkSync('.jbooter/A.json');
          fs.unlinkSync('.jbooter/B.json');
          fs.unlinkSync('.jbooter/C.json');
          fs.unlinkSync('.jbooter/D.json');
          fs.rmdirSync('.jbooter');
          done();
        }, 1000);
      });
    });
  });
});
