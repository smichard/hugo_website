---
title: "Cloud Native Tutorial"
date: 2023-03-07
draft: false
author: "Stephan Michard"
authorLink: "https://stephan.michard.io"
categories: ["Projects"]
tags: ["Container","Kubernetes","Google-Cloud", "Tutorial"]

toc:
  enable: true
---

# Introduction
Last year I created a tutorial which explains the basics of application deployment in a cloud-native environment. I have also recorded videos for the individual chapters for a Dell internal learning platform, these are not publicly available.   
With this post I describe the individual chapters of the tutorial, the individual parts of the tutorial follow on from each other. The corresponding code can be found on GitHub. A simple website serves as a sample application and can be run as a container in various cloud environments. The sample application’s source code is part of the tutorial.  
For simplicity, do not attempt this while using a corporate firewall. Comments, additions, and collaboration are welcome.

{{< button href="https://github.com/smichard/cloud_bites_tutorial" >}} Find the code on GitHub {{< /button >}}  
***
# 1. Setup of local environment
The tutorial provides a virtual machine (VM) to ensure a consistent development environment. This VM is deployed using [Vagrant](https://www.vagrantup.com/). Vagrant allows it to leverage a declarative configuration file that describes the required software, packages, and operating system configuration. The VM used in this tutorial is based on Ubuntu 20.04 LTS. The VM is allocated 1 vCPU and 4 GB of RAM.  
We recommend [Virtualbox](https://www.virtualbox.org/) as the virtualization software for this tutorial.  
This tutorial uses [Visual Studio Code](https://code.visualstudio.com/) as a code editor.  

After installing the three components (Vagrant, VirtualBox, and Visual Studio Code), the GitHub repository can be cloned, and the VM can be started. The first line ensures that that the software tracking tool git is still installed if it is not already present on the PC:
```bash
winget install --id Git.Git -e --source winget
git config --global core.autocrlf false
git clone https://github.com/smichard/cloud_bites_tutorial
cd cloud_bites_tutorial
vagrant up
```
After the VM has started and all software components have been fully installed, you can log into the VM via ssh: 
```bash
vagrant ssh
```
The VM has been configured to mount the host PC's file system, it is available in the *vagrant* folder:
```bash
cd /vagrant
```

# 2. Build and run Docker containers locally
In this section, a container with the demo application is created first. This container is started locally can be reached via the host PC’s web browser.  

Switch to the directory:
```bash
cd cloud_bites_tutorial/1_2_app_sources
```
View the container images available in the VM:
```bash
docker images
```
Build the container image based on the folder’s Dockerfile:
```bash
docker build -t <image_name> .
docker images
```
Running the Docker container. With the following command the container runs in the background and the VM ports *8082* are mapped to the container port *80*. The website is available via the Host PC's web browser at *localhost:8082*:
```bash
docker run -d -p 8082:80 <image_name>
```

The sample application’s source code can be modified easily with the help of a small helper script. This helper script is run twice, and the container image is rebuilt twice. The commands shown start new containers with the newly generated container images. The website is then available via the host PC's web browser under *localhost:8083* and *localhost:8084*:
```bash
./update_script.sh
docker build -t <image_name_2> .
docker run -d -p 8083:80 <image_name_2>
./update_script.sh
docker build -t <image_name_3> .
docker run -d -p 8084:80 <image_name_3>
```

Running containers can be listed and stopped with the following commands:
```bash
docker ps
docker kill <container_id>
```

The created container images can be pushed to the container registry if you have an account on Docker Hub. The container image must contain the Dockerhub username. So, the container image may need to be rebuilt or named appropriately via a tag:
```bash
docker login
docker push <dockerhub_username>/<image_name>
```

# 3. Deploy a local Kubernetes cluster using K3D
In the following section you are going to use the [K3D](https://k3d.io) project to locally deploy a minimal Kubernetes cluster. K3D is a lightweight wrapper to run [K3S](https://k3s.io), Rancher Lab’s minimal Kubernetes distribution, in Docker. K3D makes it very easy to create single- and multi-node K3S clusters in Docker, e.g. for local development on Kubernetes. A good introduction to K3D with some use cases can be found in the [DevOps Toolkit YouTube video](https://www.youtube.com/watch?v=mCesuGk-Fks).  

Deploy a local K3D cluster with three control planes and three worker nodes:
```bash
k3d cluster create local-cluster --servers 3 --agents 3 -p "8080:80@loadbalancer"
```

The cluster and the individual nodes can be displayed with the following commands:
```bash
k3d cluster list
kubectl get nodes
```

The following command deploys the demo application to the local Kubernetes cluster that has just been created. This step creates a deployment with multiple pods, a service, and an ingress controller. You can find the declarative configuration in the `1_3_local_deployment/deployment.yml` file:
```bash
kubectl apply -f 1_3_local_deployment/deployment.yml
```

The following command displays the deployment, the replica set, the pods, and the service:
```bash
kubectl get deployments,replicasets,pods,services
```
The website is then available via the host PC's web browser under *localhost:8080*.

# 4. Basic operations to handle Pods and Deployments
The following section details a few basic commands for handling pods and deployments. The following commands create two pods named `my-pod-1` and `my-pod-2` each with the container image `nginx:alpine`. The last command shows all pods running in the default namespace:
```bash
kubectl run my-pod-1 --image=nginx:alpine
kubectl run my-pod-2 --image=nginx:alpine
kubectl get pods
```

The following command will stop and delete the pod named `my-pod-1`. Since this pod is not part of a ReplicaSet, it will not be restarted:
```bash
kubectl delete pod my-pod-1
kubectl get pods
```

The following command scales the deployment created in the previous section to six replicas. The second command displays the deployment, the replica sets, and the pods in the default namespace. Now, six pods should be shown for `dpl-demo-1`:
```bash
kubectl scale deployment dpl-demo-1 --replicas=6
kubectl get deployments,replicasets,pods
```
Now it's time to change the deployment. The `1_3_local_deployment/deployment.yml` file must be modified to do this. For example, in line 24, the container image can be changed from `demo-app:sydney` to `demo-app:london`. The adjusted deployment is rolled out again with the following command:
```bash
kubectl apply -f 1_3_local_deployment/deployment.yml
kubectl get deployments,replicasets,pods
```
The second command displayed the deployment, the replica sets, and the pods for the default namespace. By launching the changed deployment, a new replica set was created in which the number of pods is scaled up to the required number of pods. The number of pods for the existing replica set is scaled to zero.  
The deployment is changed a second time and rolled out again. How does this occur? The container image is modified from `demo-app:london` to `demo-app:newyork` in line 24 of the `1_3_local_deployment/deployment.yml` file. The adjusted deployment is rolled out again with the following command:
```bash
kubectl apply -f 1_3_local_deployment/deployment.yml
kubectl get deployments,replicasets,pods
```
The demo application’s website is always available via the host PC's web browser via *localhost:8080*.  
The following command shows a list of revisions for the `dpl-demo-1` deployment. The second command displays details for a specific revision:
```bash
kubectl rollout history deployment dpl-demo-1
kubectl rollout history deployment dpl-demo-1 --revision=2
```
Use the following command to roll back the deployment to a specific revision: 
```bash
kubectl rollout undo deployment dpl-demo-1 --to-revision=2
```
If the deployment is rolled back, the number of pods for the corresponding ReplicaSet is scaled, meaning no new ReplicaSet is created, but an existing one is used.  

# 5. Deploy a remote Kubernetes cluster using Google Cloud – part 1
In the following section, a Kubernetes cluster is deployed in a public cloud. For this purpose, we use [Google Cloud](https://cloud.google.com/) in this tutorial. For simplicity, we assume that a Google Cloud account already exists.
{{< notice warning >}}
Costs are generated at the public cloud provider used in the following tutorial sections. It is, therefore, vital to limit the runtime of the clusters and prevent possible idle time to minimize costs.
{{< /notice >}}

First, obtain access to your Google Cloud account:
```bash
gcloud auth login
```

The following command creates a new Google Cloud project, generating a random project name. Last, the newly created project is specified in the active configuration.
```bash
PROJECT_ID="gcp-$(($(date +%s%d)/1000000))$(($RANDOM%20))" && echo $PROJECT_ID
gcloud projects create ${PROJECT_ID} --name "${PROJECT_ID}"
gcloud config set project ${PROJECT_ID}
```

Before proceeding with the tutorial, make sure to [enable billing](https://cloud.google.com/billing/docs/how-to/modify-project#enable_billing_for_a_new_project) on the new project.  

Then some required Google Cloud APIs have to be activated:
```bash
gcloud services enable compute.googleapis.com container.googleapis.com
```

For simplicity let's define a default compute region and a default compute zone:
```bash
gcloud config set compute/region europe-west3
gcloud config set compute/zone europe-west3a
```

Finally, the Kubernetes cluster can be deployed:
```bash
gcloud beta container clusters create my-gke-cluster --zone europe-west3-a
```

To interact with the newly created Kubernetes Cluster, fetch its credentials. This commands updates the local *kubeconfig* file with the appropriate credentials and endpoint information:
```bash
gcloud container clusters get-credentials my-gke-cluster
```

Now the demo application can be deployed on the newly created cluster:
```bash
kubectl apply -f 1_5_cloud_deployment/deployment.yml
```
A load balancer was created as a networking service in the previous step. After a certain wait time, a public IP address is displayed. The website of the demo application can then be reached via a web browser:
```bash
kubectl get services
```

The Kubernetes cluster can be deleted with the following command:
```bash
gcloud container clusters delete my-gke-cluster
```

# 6. Deploy a remote Kubernetes cluster using Google Cloud – part 2
In this section, another Kubernetes cluster is created on Google Cloud. This time, the Cloud Console is used:
{{< figure src="/images/posts/google_cloud_gke.png" title="Google Cloud Screenshot" >}}

Once the Kubernetes Cluster has been created successfully, fetch its credentials:
```bash
gcloud container clusters get-credentials my-gke-cluster-2
```

Now the demo application can be deployed on the newly created cluster:
```bash
kubectl apply -f 1_5_cloud_deployment/deployment.yml
```
A load balancer was created as a networking service in the previous step. After a certain wait time, a public IP address is displayed. The website of the demo application can then be reached via a web browser:
```bash
kubectl get services
```

{{< notice tip >}}
It is crucial to delete the Kubernetes cluster if unused to keep costs low.
{{< /notice >}}

# 7. Deploy a remote Kubernetes cluster leveraging Terraform
In this section a Kubernetes cluster is created on Google Cloud leveraging [Terraform](https://www.terraform.io). Terraform is an infrastructure as code tool allowing one to build infrastructure safely and efficiently in a declarative way on various platforms.    
First the Google Cloud environment has to be prepared by enabling a couple of API's:
```bash
gcloud services enable compute.googleapis.com container.googleapis.com
```

The following command authorizes the Google Cloud SDK to access Google Cloud using your user account credentials. This step adds your account to the Application Default Credentials, allowing Terraform to access these credentials to provision resources on Google Cloud:
```bash
gcloud auth application-default login
```

The following command initializes a working directory containing Terraform configuration files:
```bash
cd 1_7_terraform_deployment
terraform init
```

The **terraform plan** command creates an execution plan, which lets you preview the changes that Terraform plans to make to your infrastructure. By default, when Terraform creates a plan it:  
- Reads the current state of any already-existing remote objects to make sure that the Terraform state is up-to-date.
- Compares the current configuration to the prior state and noting any differences.
- Proposes a set of change actions that should, if applied, make the remote objects match the configuration.
With the following command, you will create a Terraform plan. You must pass the project ID generated earlier as a variable:
```bash
terraform plan -var project_id=${PROJECT_ID}
```
The **terraform apply** command executes the actions proposed in a Terraform plan.
```bash
terraform apply -var project_id=${PROJECT_ID}
```

After creating the Kubernetes Cluster successfully, you can fetch its credentials:
```bash
gcloud container clusters get-credentials my-terraform-cluster --region europe-west3
```

Now the demo application can be deployed on the newly created cluster:
```bash
kubectl apply -f 1_5_cloud_deployment/deployment.yml
```
A load balancer was created as a networking service in the previous step. After a certain wait time, a public IP address is displayed. The website of the demo application can then be reached via a web browser:
```bash
kubectl get services
```

The **terraform destroy** command conveniently eliminates all remote objects managed by a particular Terraform configuration:
```bash
terraform destroy -var project_id=${PROJECT_ID}
```

If you don’t need your Google Cloud project anymore, you can delete the project:
```bash
gcloud projects delete ${PROJECT_ID}
```

# 8. Visualize Kubernetes workloads with VMware Octant
You will explore, in this section, the various Kubernetes clusters created earlier with [VMware Octant](https://octant.dev/). Octant is a tool for developers to understand how applications run on a Kubernetes cluster. It aims to be part of the developer’s toolkit for gaining insight and approaching complexity found in Kubernetes. Octant offers a combination of introspective tooling, cluster navigation, and object management. It also provides a plugin system to extend its capabilities further.   

Start Octant:
```bash
octant
```
The Octant application can be reached via a web browser of the host PC using *localhost:8001*.

# Summary
The tutorial gives a quick overview of the basics of application deployment in a cloud-native environment. This tutorial is intended to provide an easy introduction with a quick learning curve. There is by far no claim to completeness. There are certainly ways to improve or expand the tutorial.  
You can download the slides I used to present the tutorial via the following link:
{{< download file="/documents/Cloud_Bites_Slides.pdf" title="Download slide deck" >}}  

# References
- GitHub - [link](https://github.com/smichard/cloud_bites_tutorial)
- Cloud-Native Computing Foundation - [link](https://www.cncf.io/)
- Virtualbox - [link](https://www.virtualbox.org/)
- Vagrant - [link](https://www.vagrantup.com/)
- K3D - [link](https://k3d.io/v5.4.6/)
- Terraform - [link](https://www.terraform.io/)
- Visual Studio Code - [link](https://code.visualstudio.com/)
- VMware Octant - [link](https://octant.dev/)
- Introduction to K3D on Youtube - [link](https://youtu.be/mCesuGk-Fks)
- Introduction Terraform on Youtube - [link](https://youtu.be/l5k1ai_GBDE)