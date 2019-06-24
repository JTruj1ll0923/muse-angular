import { Injectable, OnDestroy } from '@angular/core'
import { IUser } from '../user/user.model'
import { IWorkflowContainer } from './models/workflows/workflow-container.model'
import { StepType } from './models/workflows/workflow-step.model'
import { IWorkflowTrend } from './models/workflow-trend.model'
import { AuthService } from '../user/auth.service'
import { IWorkflowOption } from './models/workflows/workflow-option.model'
import { HttpService } from '../shared/http.service'
import { HttpClient } from '@angular/common/http'
import { IWorkflowDepartment } from './models/workflows/workflow-department.model'
import { tap } from 'rxjs/operators'
import { Subscription, Observable } from 'rxjs'

@Injectable()
export class HaniService extends HttpService implements OnDestroy {
  constructor(protected http: HttpClient, public auth: AuthService) {
    super(http, auth)
  }

  private departmentList: IWorkflowDepartment[]
  private CPE: object
  private AP: object
  private commandUrl = 'command'
  private workflowUrl = 'hani'
  public trendingUrl = 'trending'
  private trendingSubscription: Subscription
  private workflowComplete: IWorkflowOption = {
    step: ['Q', 0, null],
    label: 'Complete',
    infoData: {
      learnMore: 'Complete',
      why:
        'You have completed this workflow. If you are still experiencing issues, please contact QRF',
      what: {
        'Customer ID': null,
        Workflow: null,
        'Where you are in the Workflow': null,
        'AP Device Name': null,
        'AP IP': null,
        'CPE MAC': null,
        'CPE IP': null,
        Question:
          'I have completed the current workflow, but my customer is still experiencing issues.'
      },
      disposition: [[0, null], [1, null], [2, null], [3, null], [4, null]],
      autoText: null
    },
    options: [['Complete', ['0', 0, '0']]]
  }

  public get departments() {
    return this.departmentList
  }
  public get completeWorkflow() {
    return this.workflowComplete
  }

  public compareArrays(array1, array2) {
    return (
      array1.length === array2.length && array1.every((value, index) => value === array2[index])
    )
  }

  public gatherWorkflowTrend(
    workflow: IWorkflowContainer,
    step: StepType,
    workflowTrendArray: Array<IWorkflowTrend>
  ) {
    const date = Date.now()
    const workflowName = workflow.workflowName
    workflowTrendArray.push({ workflow: workflowName, step, date })
  }

  public replaceArray(array: [string, string]) {
    const objToSearch = array[0] === 'CPE' ? this.CPE : this.AP
    const keyToFind = array[1]
    return objToSearch[keyToFind]
  }

  public getCommands() {
    return this.getEntry(this.commandUrl).pipe(
      tap(radio => {
        radio.forEach(device => {
          if (device.deviceType === 'cpe') {
            this.CPE = device.commands as object
          } else {
            this.AP = device.commands as object
          }
        })
      })
    )
  }
  public getWorkflows() {
    return this.getEntry(this.workflowUrl).pipe(
      tap(departments => {
        this.departmentList = departments
      })
    )
  }

  public postTracking(workflowTrendArray) {
    return this.postEntry(this.trendingUrl, {
      trending: workflowTrendArray,
      user: { firstName: this.auth.firstName, lastName: this.auth.lastName }
    })
  }

  ngOnDestroy() {
    if (this.trendingSubscription) {
      this.trendingSubscription.unsubscribe()
    }
  }
}
